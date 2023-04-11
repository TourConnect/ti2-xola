const { makeExecutableSchema } = require('@graphql-tools/schema');
const { graphql } = require('graphql');
const R = require('ramda');
const jwt = require('jsonwebtoken');

const resolvers = {
  Query: {
    key: ({ avails, preparedOrder }, args) => {
      const {
        jwtKey,
      } = args;
      if (!jwtKey) return null;
      const { arrivalTime, arrival } = R.path(['items', 0], preparedOrder);
      const a = avails[arrival];
      if (a && arrivalTime && a[arrivalTime] === 0) return null;
      if (a && a[0] === 0) return null;
      return jwt.sign(preparedOrder, jwtKey);
    },
    dateTimeStart: ({ preparedOrder }) => R.path(['items', 0, 'arrivalDatetime'], preparedOrder),
    dateTimeEnd: ({ preparedOrder }) => R.path(['items', 0, 'arrivalDatetime'], preparedOrder),
    allDay: ({ preparedOrder }) => !preparedOrder.arrivalTime,
    vacancies: ({ avails, preparedOrder }) => {
      const { arrivalTime, arrival } = preparedOrder;
      if (avails[arrival] && arrivalTime && !isNaN(avails[arrival][arrivalTime])) return avails[arrival][arrivalTime];
      return R.pathOr(0, [arrival, 0], avails);
    },
    available: ({ avails, preparedOrder }) => {
      const { arrivalTime, arrival } = R.path(['items', 0], preparedOrder);
      const a = avails[arrival];
      if (a && arrivalTime && a[arrivalTime] > 1) return true;
      if (a && a[0] > 1) return true;
      return false;
    },
    // get the starting price
    pricing: ({ preparedOrder }) => ({
      original: preparedOrder.amount,
      retail: preparedOrder.amount,
      net: preparedOrder.amount,
    }),
    unitPricing: ({ preparedOrder }) => {
      const { lineItems } = R.path(['items', 0], preparedOrder);
      return lineItems.filter(d => d.object === 'lineitem_demographic').map(d => {
        return {
          unitId: R.path(['demographic', 'id'], d),
          original: d.price,
          retail: d.price,
          net: d.price,
          currencyPrecision: 0,
        };
      });
    },
    pickupPoints: root => R.pathOr([], ['pickupPoints'], root),
  },
};


const translateAvailability = async ({ rootValue, variableValues, typeDefs, query }) => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })
  const retVal = await graphql({
    schema,
    rootValue,
    source: query,
    variableValues,
  });
  if (retVal.errors) throw new Error(retVal.errors);
  return retVal.data;
};
module.exports = {
  translateAvailability,
};
