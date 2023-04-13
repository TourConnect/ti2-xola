const axiosRaw = require('axios');
const curlirize = require('axios-curlirize');
const R = require('ramda');
const Promise = require('bluebird');
const assert = require('assert');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const wildcardMatch = require('./utils/wildcardMatch');
const { translateProduct } = require('./resolvers/product');
const { translateAvailability } = require('./resolvers/availability');
const { translateBooking } = require('./resolvers/booking');
const { translateRate } = require('./resolvers/rate');

const endpoint = 'https://sandbox.xola.com/api';

const CONCURRENCY = 3; // is this ok ?
if (process.env.debug) {
  curlirize(axiosRaw);
}

const isNilOrEmpty = R.either(R.isNil, R.isEmpty);

const getHeaders = ({ apiKey, requestId }) => ({
  'X-API-KEY': apiKey,
  'X-API-VERSION': '2020-05-04',
  'Content-Type': 'application/json',
  ...requestId ? { requestId } : {},
});


const axiosSafeRequest = R.pick(['headers', 'method', 'url', 'data']);
const axiosSafeResponse = response => {
  const retVal = R.pick(['data', 'status', 'statusText', 'headers', 'request'], response);
  retVal.request = axiosSafeRequest(retVal.request);
  return retVal;
};
class Plugin {
  constructor(params) { // we get the env variables from here
    Object.entries(params).forEach(([attr, value]) => {
      this[attr] = value;
    });
    if (this.events) {
      axiosRaw.interceptors.request.use(request => {
        this.events.emit(`${this.name}.axios.request`, axiosSafeRequest(request));
        return request;
      });
      axiosRaw.interceptors.response.use(response => {
        this.events.emit(`${this.name}.axios.response`, axiosSafeResponse(response));
        return response;
      });
    }
    const pluginObj = this;
    this.axios = async (...args) => axiosRaw(...args).catch(err => {
      console.log(`error in ${this.name}`, err.response.data);
      const errMsg = R.omit(['config'], err.toJSON());
      if (pluginObj.events) {
        pluginObj.events.emit(`${this.name}.axios.error`, {
          request: args[0],
          err: errMsg,
        });
      }
      throw R.pathOr(err, ['response', 'data', 'error'], err);
    });
    this.tokenTemplate = () => ({
      sellerId: {
        type: 'text',
        regExp: '^[a-fA-F0-9]{24}$',
        description: 'the seller id from Xola',
      },
      affiliateId: {
        type: 'text',
        regExp: '^[A-Za-z0-9]+$',
        description: 'the affiliate id provided from Xola',
      },
      affiliateCode: {
        type: 'text',
        regExp: '^[A-Za-z0-9]+$',
        description: 'the affiliate code provided from Xola',
      },
    });
  }

  async validateToken({
    token: {
      sellerId,
    },
    requestId,
  }) {
    const url = `${endpoint || this.endpoint}/experiences?seller=${sellerId}`;
    const headers = getHeaders({
      apiKey: this.apiKey,
      requestId,
    });
    try {
      const products = R.path(['data', 'data'], await this.axios({
        method: 'get',
        url,
        headers,
      }));
      return Array.isArray(products) && products.length > 0;
    } catch (err) {
      return false;
    }
  }

  async searchProducts({
    token: {
      sellerId,
    },
    payload,
    typeDefsAndQueries: {
      productTypeDefs,
      productQuery,
    },
    requestId,
  }) {
    let url = `${endpoint || this.endpoint}/experiences?seller=${sellerId}`;
    if (!isNilOrEmpty(payload)) {
      if (payload.productId) {
        url = `${url}/${payload.productId}`;
      }
    }
    const headers = getHeaders({
      apiKey: this.apiKey,
      requestId,
    });
    let results = R.pathOr([], ['data', 'data'], await this.axios({
      method: 'get',
      url,
      headers,
    }));
    if (!Array.isArray(results)) results = [results];
    let products = await Promise.map(results, async product => {
      return translateProduct({
        rootValue: product,
        typeDefs: productTypeDefs,
        query: productQuery,
      });
    });
    // dynamic extra filtering
    if (!isNilOrEmpty(payload)) {
      const extraFilters = R.omit(['productId'], payload);
      if (Object.keys(extraFilters).length > 0) {
        products = products.filter(
          product => Object.entries(extraFilters).every(
            ([key, value]) => {
              if (typeof value === 'string') return wildcardMatch(value, product[key]);
              return true;
            },
          ),
        );
      }
    }
    return ({ products });
  }

  async searchQuote({
    token: {
      sellerId,
    },
    payload: {
      productIds,
      optionIds,
    },
  }) {
    return { quote: [] };
  }

  async searchAvailability({
    token: {
      sellerId,
      affiliateCode,
    },
    payload: {
      productIds,
      optionIds,
      units,
      startDate,
      endDate,
      dateFormat,
      currency,
    },
    typeDefsAndQueries: {
      availTypeDefs,
      availQuery,
    },
    requestId,
  }) {
    assert(this.jwtKey, 'JWT secret should be set');
    assert(
      productIds.length === optionIds.length,
      'mismatched productIds/options length',
    );
    assert(
      optionIds.length === units.length,
      'mismatched options/units length',
    );
    assert(productIds.every(Boolean), 'some invalid productId(s)');
    assert(optionIds.every(Boolean), 'some invalid optionId(s)');
    const localDateStart = moment(startDate, dateFormat).format('YYYY-MM-DD');
    const localDateEnd = moment(endDate, dateFormat).format('YYYY-MM-DD');
    const headers = getHeaders({
      apiKey: this.apiKey,
      requestId,
    });
    const url = `${endpoint || this.endpoint}`;
    let availability = (
      await Promise.map(productIds, async (productId, ix) => {
        const [{ data: avails }, { data: preparedOrder }] = await Promise.all([
          this.axios({
            method: 'get',
            url: `${url}/experiences/${productId}/availability?start=${localDateStart}&end=${localDateEnd}`,
            headers,
          }),
          this.axios({
            method: 'post',
            url: `${url}/orders/prepare`,
            headers,
            data: {
              items: [
                {
                  experience: {
                    id: productId
                  },
                  arrival: localDateStart,
                  ...(optionIds[ix] === 'default' ? {} : {
                    arrivalTime: optionIds[ix],
                  }),
                  lineItems: [...units[ix].map(u => ({
                    object: 'lineitem_demographic',
                    demographic: {
                      id: u.unitId
                    },
                    quantity: u.quantity,
                  }))]
                }
              ]
            },
          })
        ]);
        /*
          avails = {
            "2023-05-01": [
                99999
            ],
            "2023-05-02": [
                99999
            ]
        }
        */
        return [{ avails, preparedOrder }];
      }, { concurrency: CONCURRENCY })
    );
    availability = await Promise.map(availability,
      avails => {
        return Promise.map(avails, avail => {
          return translateAvailability({
            typeDefs: availTypeDefs,
            query: availQuery,
            rootValue: avail,
            variableValues: {
              jwtKey: this.jwtKey,
            },
          });
        });
      },
    );
    return { availability };
  }

  async availabilityCalendar({
    token: {
      sellerId,
    },
    payload: {
      productIds,
      optionIds,
      units,
      startDate,
      endDate,
      currency,
      dateFormat,
    },
    typeDefsAndQueries: {
      availTypeDefs,
      availQuery,
    },
    requestId,
  }) {
    return { availability: [] };
    assert(this.jwtKey, 'JWT secret should be set');
    assert(
      productIds.length === optionIds.length,
      'mismatched productIds/options length',
    );
    assert(
      optionIds.length === units.length,
      'mismatched options/units length',
    );
    assert(productIds.every(Boolean), 'some invalid productId(s)');
    assert(optionIds.every(Boolean), 'some invalid optionId(s)');
    const localDateStart = moment(startDate, dateFormat).format('YYYY-MM-DD');
    const localDateEnd = moment(endDate, dateFormat).format('YYYY-MM-DD');
    const headers = getHeaders({
      apiKey: this.apiKey,
      requestId,
    });
    const url = `${endpoint || this.endpoint}/experiences`;
    const availability = (
      await Promise.map(productIds, async (productId, ix) => {
        const data = {
          productId,
          optionId: optionIds[ix],
          localDateStart,
          localDateEnd,
          units: units[ix].map(u => ({ id: u.unitId, quantity: u.quantity })),
        };
        if (currency) data.currency = currency;
        const result = await this.axios({
          method: 'get',
          url: `${url}/${productId}/availability?start=${localDateStart}&end=${localDateEnd}}`,
          headers,
        });
        return Promise.map(result.data, avail => translateAvailability({
          rootValue: avail,
          typeDefs: availTypeDefs,
          query: availQuery,
        }))
      }, { concurrency: CONCURRENCY })
    );
    return { availability };
  }

  async createBooking({
    token: {
      sellerId,
      affiliateCode,
      affiliateId,
    },
    payload: {
      availabilityKey,
      holder,
      notes,
      reference,
      // settlementMethod,
    },
    typeDefsAndQueries: {
      bookingTypeDefs,
      bookingQuery,
    },
    requestId,
  }) {
    assert(availabilityKey, 'an availability code is required !');
    assert(R.path(['name'], holder), 'a holder\' first name is required');
    assert(R.path(['surname'], holder), 'a holder\' surname is required');
    const headers = getHeaders({
      apiKey: this.apiKey,
      requestId,
    });
    const urlForCreateBooking = `${endpoint || this.endpoint}/orders`;
    const dataFromAvailKey = await jwt.verify(availabilityKey, this.jwtKey);
    let booking = R.path(['data'], await this.axios({
      method: 'post',
      url: urlForCreateBooking,
      data: {
        ...dataFromAvailKey,
        customerName: `${holder.name} ${holder.surname}`,
        email: R.path(['emailAddress'], holder),
        phone: R.pathOr('', ['phoneNumber'], holder),
        source: 'xola',
        notes: [{ text: notes }],
        ...(affiliateCode ? {
          affiliate: affiliateCode,
          payment: {
            method: 'cc',
          },
          adjustments: [
            {
              payment: {
                code: affiliateCode,
                method: 'affiliate_deposit'
              },
              caption: affiliateCode, // or whatever you want caption to be
              code: affiliateId, // this needs to be id of a code
              voucher: reference,
              type: 'affiliate_deposit',
              amount: -1 * dataFromAvailKey.amount, // deposit is a negative amount of it's actual value 
            }
        ],
        } : {
          payment: {
            method: 'gift',
          },
        }),
      },
      headers,
    }));
    // booking = R.path(['data'], await this.axios({
    //   method: 'post',
    //   url: `${endpoint || this.endpoint}/orders/${booking.id}/accept`,
    //   data: dataForConfirmBooking,
    //   headers,
    // }));
    console.log(booking);
    return ({
      booking: await translateBooking({
        rootValue: booking,
        typeDefs: bookingTypeDefs,
        query: bookingQuery,
      })
    });
  }

  async cancelBooking({
    token: {
      sellerId,
    },
    payload: {
      bookingId,
      id,
      reason,
    },
    typeDefsAndQueries: {
      bookingTypeDefs,
      bookingQuery,
    },
    requestId,
  }) {
    assert(!isNilOrEmpty(bookingId) || !isNilOrEmpty(id), 'Invalid booking id');
    const headers = getHeaders({
      apiKey: this.apiKey,
      requestId,
    });
    // let booking = R.path(['data'], await this.axios({
    //   method: 'get',
    //   url: `${endpoint || this.endpoint}/orders/${bookingId || id}`,
    //   headers,
    // }));
    const booking = { status: 200 }
    const canceled = R.path(['data'], await this.axios({
      method: 'post',
      url: `${endpoint || this.endpoint}/orders/${bookingId || id}/${booking.status < 200 ? 'decline' : 'cancel'}`,
      data: {
        amount: 0,
      },
      headers,
    }));
    console.log(canceled)
    booking = R.path(['data'], await this.axios({
      method: 'get',
      url: `${endpoint || this.endpoint}/orders/${bookingId || id}`,
      headers,
    }));
    return ({
      cancellation: await translateBooking({
        rootValue: booking,
        typeDefs: bookingTypeDefs,
        query: bookingQuery,
      })
    });
  }

  async searchBooking({
    token: {
      apiKey,
      sellerId,
    },
    token,
    payload: {
      bookingId,
      travelDateStart,
      travelDateEnd,
      dateFormat,
    },
    typeDefsAndQueries: {
      bookingTypeDefs,
      bookingQuery,
    },
    requestId,
  }) {
    console.log(token);
    assert(
      !isNilOrEmpty(bookingId)
      || !(
        isNilOrEmpty(travelDateStart) && isNilOrEmpty(travelDateEnd) && isNilOrEmpty(dateFormat)
      ),
      'at least one parameter is required',
    );
    const headers = getHeaders({
      apiKey: this.apiKey,
      requestId,
    });
    const searchByUrl = async url => {
      try {
        return R.path(['data', 'data'], await this.axios({
          method: 'get',
          url,
          headers,
        }));
      } catch (err) {
        return [];
      }
    };
    const bookings = await (async () => {
      if (bookingId) {
        // return searchByUrl(`${endpoint || this.endpoint}/orders/${bookingId}`);
        const allBookings = await searchByUrl(`${endpoint || this.endpoint}/orders?seller=${sellerId}`);
        return allBookings.filter(booking => booking.id === bookingId);
      }
      if (travelDateStart) {
        const localDateStart = moment(travelDateStart, dateFormat).format('YYYY-MM-DD');
        url = `${endpoint || this.endpoint}/orders?seller=${sellerId}&items.arrival=${encodeURIComponent(localDateStart)}`;
        return searchByUrl(url);
      }
      return [];
    })();
    return ({
      bookings: await Promise.map(R.unnest(bookings), async booking => {
        return translateBooking({
          rootValue: booking,
          typeDefs: bookingTypeDefs,
          query: bookingQuery,
        });
      })
    });
  }
}

module.exports = Plugin;
