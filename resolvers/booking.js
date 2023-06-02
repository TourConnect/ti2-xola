const { makeExecutableSchema } = require('@graphql-tools/schema');
const R = require('ramda');
const { graphql } = require('graphql');

const capitalize = sParam => {
  if (typeof sParam !== 'string') return '';
  const s = sParam.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};
const isNilOrEmptyArray = el => {
  if (!Array.isArray(el)) return true;
  return R.isNil(el) || R.isEmpty(el);
};

const resolvers = {
  Query: {
    id: R.path(['id']),
    orderId: R.pathOr('', ['items', 0, 'shortCode']),
    bookingId: R.pathOr('', ['items', 0, 'ticketCode']),
    supplierBookingId: R.path(['items', 0, 'ticketCode']),
    status: e => {
      const status = R.path(['items', 0, 'status'], e);
      if (status === 103) return 'On Hold';
      if (status < 200) return 'Pending';
      if (status === 700) return 'Cancelled';
      if (status >= 200 && status < 300) return 'Confirmed';
    },
    productId: R.path(['items', 0, 'id']),
    productName: R.path(['items', 0, 'name']),
    cancellable: root => {
      const status = R.path(['items', 0, 'status'], root);
      if (status < 300) return true;
      return false;
    },
    editable: () => false,
    unitItems: ({ items = [], allDemographics = [] }) => {
      return R.pathOr([], [0, 'guests'], items).map(guest => {
        /*
        guests: [
           {
             id: '647918eb2412645f2330e33d',
             demographic: {
               id: '647917e442b33f1e963398a2',
               quantity: 2,
               demographic: { id: '643d733e45c0452ed70d1a7e' }
             },
             ticketCode: 'd6cnzdd67wg0',
             guestStatus: 'pending'
           },
           {
             id: '647918eb2412645f2330e33e',
             demographic: {
               id: '647917e442b33f1e963398a2',
               quantity: 2,
               demographic: { id: '643d733e45c0452ed70d1a7e' }
             },
             ticketCode: '4x6qbjirvkw0',
             guestStatus: 'pending'
           }
         ]
        */
        const foundDemographic = allDemographics.find(d => d.id === R.path(['demographic', 'demographic', 'id'], guest));
        return {
          unitItemId: R.path(['id'], guest),
          unitId: R.path(['id'], foundDemographic),
          unitName: R.pathOr('', ['label'], foundDemographic),
        };
      });
    },
    start: R.path(['items', 0, 'arrivalDatetime']),
    allDay: root => !R.path(['items', 0, 'arrivalTime'], root),
    bookingDate: R.path(['createdAt']),
    holder: root => ({
      name: R.pathOr('', ['customerName'], root).split(' ')[0],
      surname: R.pathOr('', ['customerName'], root).split(' ')[1],
      fullName: R.path(['customerName'], root),
      phoneNumber: R.path(['phone'], root),
      emailAddress: R.path(['customerEmail'], root),
    }),
    notes: R.pathOr('', ['notes', 0, 'text']),
    price: root => ({
      original: R.path(['amount'], root),
      retail: R.path(['amount'], root),
      currencyPrecision: R.pathOr(0, ['currencyPrecision'], root),
      currency: R.path(['currency'], root),
    }),
    cancelPolicy: root => {
      return '';
    },
    optionId: root => R.path(['items', 0, 'arrivalTime'], root) || 'default',
    optionName: root => R.path(['items', 0, 'arrivalTime'], root)
      || R.path(['items', 0, 'name'], root),
    // TODO
    // resellerReference: R.propOr('', 'resellerReference'),
    // publicUrl: R.prop('confirmation_url'),
    // privateUrl: R.prop('dashboard_url'),
    // pickupRequested: R.prop('pickupRequested'),
    // pickupPointId: R.prop('pickupPointId'),
    // pickupPoint: root => {
    //   const pickupPoint = R.path(['pickupPoint'], root);
    //   if (!pickupPoint) return null;
    //   return {
    //     ...pickupPoint,
    //     postal: pickupPoint.postal_code,
    //   };
    // },
  },
};


const translateBooking = async ({ rootValue, typeDefs, query }) => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const retVal = await graphql({
    schema,
    rootValue,
    source: query,
  });
  if (retVal.errors) throw new Error(retVal.errors);
  return retVal.data;
};

module.exports = {
  translateBooking,
};
