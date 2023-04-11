const { makeExecutableSchema } = require('@graphql-tools/schema');
const R = require('ramda');
const { graphql } = require('graphql');

const resolvers = {
  Query: {
    productId: R.path(['id']),
    productName: R.path(['name']),
    availableCurrencies: root => root.currency ? [root.currency] : [],
    defaultCurrency: R.path(['currency']),
    // options: root => [root],
    options: root => {
      if (root.schedules && root.schedules.length > 0) {
        const times = R.uniq(R.flatten(root.schedules.map(s => s.times || [])));
        if (times.length > 0) {
          return times.map(time => ({
            id: time,
            name: time,
            demographics: root.demographics,
          }));
        }
      }
      return [{ id: 'default', name: root.name, demographics: root.demographics }];
    },
    // options: root => {
    //   // https://developers.xola.com/docs/price-schemes
    //   const priceSchemes = R.propOr([], 'priceSchemes', root);
    //   return priceSchemes.map(priceScheme => {
    //     let id;
    //     const priceTypeObj = priceScheme.constraints.find(c => c.object === 'price_type_constraint');
    //     const privacyObj = priceScheme.constraints.find(c => c.object === 'privacy_constraint');
    //     const quantityObj = priceScheme.constraints.find(c => c.object === 'quantity_constraint');
    //     const schedulesObj = priceScheme.constraints.find(c => c.object === 'schedules_constraint');
    //     if (schedulesObj) {
    //       const schedules = schedulesObj.schedules.items.map(id => {
    //         const foundSchedule = root.schedules.find(s => s.id === id);
    //         if (R.path(['days', 'length'], foundSchedule)) {

    //         }
    //         return foundSchedule ? foundSchedule.name : '';
    //       });
    //     }
    //     if (quantityObj) {
    //       id = `${quantityObj.min} - ${quantityObj.max} per ${quantityObj.quantityType}`;
    //     }

    //     if (priceTypeObj && privacyObj) {
    //       id = `${privacyObj.privacy} per ${priceTypeObj.priceType}`;
    //     }
    //   });
    // },
  },
  Option: {
    optionId: R.prop('id'),
    optionName: R.prop('name'),
    units: root => {
      const demographics = R.propOr([], 'demographics', root);
      return demographics.map(demo => {
        return {
          ...demo,
          price: root.priceSchemes
        }
      });
    },
  },
  Unit: {
    unitId: R.path(['id']),
    unitName: R.pathOr('', ['label']),
    subtitle: R.pathOr('', ['label']),
    type: R.prop('label'),
    pricing: () => [],
    restrictions: R.propOr({}, 'restrictions'),
  },
};

const translateProduct = async ({
  rootValue,
  typeDefs,
  query,
}) => {
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
  translateProduct,
};
