
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

const endpoint = null;

const CONCURRENCY = 3; // is this ok ?

const isNilOrEmpty = R.either(R.isNil, R.isEmpty);

const getHeaders = ({ apiKey }) => ({
  'X-API-KEY': apiKey,
  'X-API-VERSION': '2020-05-04',
  'Content-Type': 'application/json',
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
    this.tokenTemplate = () => ({
      apiKey: {
        type: 'text',
        regExp: '^[a-zA-Z0-9]+$',
        description: 'the api key from Xola',
      },
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
    this.errorPathsAxiosErrors = () => ([ // axios triggered errors
    ]);
    this.errorPathsAxiosAny = () => ([]); // 200's that should be errors
  }

  async validateToken({
    axios,
    token: {
      sellerId,
    },
  }) {
    assert(this.apiKey, 'apiKey should be set');
    const url = `${endpoint || this.endpoint}/experiences?seller=${sellerId}`;
    const headers = getHeaders({
      apiKey: this.apiKey,
    });
    try {
      const products = R.path(['data', 'data'], await axios({
        method: 'get',
        url,
        headers,
      }));
      return Array.isArray(products) && products.length > 0;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async searchProducts({
    axios,
    token: {
      sellerId,
    },
    payload,
    typeDefsAndQueries: {
      productTypeDefs,
      productQuery,
    },
  }) {
    assert(this.apiKey, 'apiKey should be set');
    assert(this.apiKey, 'apiKey should be set');
    let url = `${endpoint || this.endpoint}/experiences?seller=${sellerId}`;
    const headers = getHeaders({
      apiKey: this.apiKey,
    });
    let results = R.pathOr([], ['data', 'data'], await axios({
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
    axios,
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
  }) {
    assert(this.apiKey, 'apiKey should be set');
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
    });
    const url = `${endpoint || this.endpoint}`;
    let availability = (
      await Promise.map(productIds, async (productId, ix) => {
        const [{ data: avails }, { data: preparedOrder }] = await Promise.all([
          axios({
            method: 'get',
            url: `${url}/experiences/${productId}/availability?start=${localDateStart}&end=${localDateEnd}`,
            headers,
          }),
          axios({
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
    axios,
    token: {
      apiKey,
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
  }) {
    return { availability: [[]] };
  }

  async createBooking({
    axios,
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
  }) {
    assert(this.apiKey, 'apiKey should be set');
    assert(availabilityKey, 'an availability code is required !');
    assert(R.path(['name'], holder), 'a holder\' first name is required');
    assert(R.path(['surname'], holder), 'a holder\' surname is required');
    const headers = getHeaders({
      apiKey: this.apiKey,
    });
    const urlForCreateBooking = `${endpoint || this.endpoint}/orders`;
    const dataFromAvailKey = await jwt.verify(availabilityKey, this.jwtKey);
    let booking = R.path(['data'], await axios({
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
          voucher: reference,
          adjustments: [
            {
              payment: {
                method: 'voucher',
                code: reference,
              },
              caption: affiliateCode, // or whatever you want caption to be
              code: affiliateId, // this needs to be id of a code
              type: 'affiliate_deposit',
              amount: -1 * dataFromAvailKey.amount, // deposit is a negative amount of it's actual value 
            }
        ],
        } : {
          payment: {
            method: 'later',
          },
        }),
      },
      headers,
    }));
    // booking = R.path(['data'], await axios({
    //   method: 'post',
    //   url: `${endpoint || this.endpoint}/orders/${booking.id}/accept`,
    //   data: dataForConfirmBooking,
    //   headers,
    // }));
    return ({
      booking: await translateBooking({
        rootValue: booking,
        typeDefs: bookingTypeDefs,
        query: bookingQuery,
      })
    });
  }

  async cancelBooking({
    axios,
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
  }) {
    assert(this.apiKey, 'apiKey should be set');
    assert(!isNilOrEmpty(bookingId) || !isNilOrEmpty(id), 'Invalid booking id');
    const headers = getHeaders({
      apiKey: this.apiKey,
    });
    // let booking = R.path(['data'], await axios({
    //   method: 'get',
    //   url: `${endpoint || this.endpoint}/orders/${bookingId || id}`,
    //   headers,
    // }));
    let booking = { status: 200 }
    const canceled = R.path(['data'], await axios({
      method: 'post',
      url: `${endpoint || this.endpoint}/orders/${bookingId || id}/${booking.status < 200 ? 'decline' : 'cancel'}`,
      data: {
        amount: 0,
      },
      headers,
    }));
    booking = R.path(['data'], await axios({
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
    axios,
    token: {
      sellerId,
    },
    payload: {
      bookingId,
      name,
      travelDateStart,
      travelDateEnd,
      purchaseDateStart,
      purchaseDateEnd,
      dateFormat,
    },
    typeDefsAndQueries: {
      bookingTypeDefs,
      bookingQuery,
    },
  }) {
    assert(this.apiKey, 'apiKey should be set');
    assert(
      !isNilOrEmpty(bookingId)
      || !(
        isNilOrEmpty(travelDateStart) && isNilOrEmpty(travelDateEnd) && isNilOrEmpty(dateFormat)
      ),
      'at least one parameter is required',
    );
    const headers = getHeaders({
      apiKey: this.apiKey,
    });
    const bookings = await (async () => {
      if (bookingId) {
        const isXolaId = new RegExp(/^[0-9a-fA-F]{24}$/).test(bookingId);
        const foundBooking = isXolaId ? await R.path(['data'], await axios({
          method: 'get',
          url: `${endpoint || this.endpoint}/orders/${bookingId}`,
          headers,
        })) : null;
        if (foundBooking) return [foundBooking];
        else {
          return R.path(['data', 'data'], await axios({
            method: 'get',
            url: `${endpoint || this.endpoint}/orders?seller=${sellerId}&search=${bookingId}`,
            headers,
          }));
        }
      }
      if (travelDateStart) {
        const localDateStart = moment(travelDateStart, dateFormat).format('YYYY-MM-DD');
        const url = `${endpoint || this.endpoint}/orders?seller=${sellerId}&items.arrival=${encodeURIComponent(localDateStart)}`;
        return R.path(['data', 'data'], await axios({
          method: 'get',
          url,
          headers,
        }));
      }
      return [];
    })();
    return ({
      bookings: await Promise.map(R.flatten(bookings), async booking => {
        return translateBooking({
          rootValue: booking,
          typeDefs: bookingTypeDefs,
          query: bookingQuery,
        });
      })
    });
  }

  async getAffiliates({
    axios,
    token: {
      sellerId,
    },
  }) {
    assert(this.apiKey, 'apiKey should be set');
    assert(sellerId, 'sellerId should be set');
    const headers = getHeaders({
      apiKey: this.apiKey,
    });
    const affiliates = await R.path(['data'], await axios({
      method: 'get',
      url: `${endpoint || this.endpoint}/users/${sellerId}/affiliates`,
      headers,
    }));
    return { affiliates };
  }
}

module.exports = Plugin;
