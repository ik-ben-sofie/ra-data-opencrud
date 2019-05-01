import difference from 'lodash/difference';
import _ from 'lodash'
type ID = string;
interface IDObject {
  id: string
}

const formatId = (id: ID) => ({ id });

export const computeFieldsToAdd = (oldIds: ID[], newIds: ID[]) => {
  return difference(newIds, oldIds).map(formatId);
};

export const computeFieldsToRemove = (oldIds: ID[], newIds: ID[]) => {
  return difference(oldIds, newIds).map(formatId);
};

export const computeFieldsToUpdate = (oldIds: ID[], newIds: ID[]) => {
  return oldIds.filter(oldId => newIds.includes(oldId)).map(formatId);
};

export const computeFieldsToAddRemoveUpdate = (oldIds: ID[], newIds: ID[]) => ({
  fieldsToAdd: computeFieldsToAdd(oldIds, newIds),
  fieldsToRemove: computeFieldsToRemove(oldIds, newIds),
  fieldsToUpdate: computeFieldsToUpdate(oldIds, newIds)
});

/**
 * When updating a relation also update the nested fields on the relation.
 *
 * Calculates the difference between the previousData passed from ReactAdmin
 * and the fields changed by the user and only sends the changed values
 * back to the GraphQL API.
 *
 * @param idList          A List of IDs of values that may have been changed
 * @param previousData    The previous data retrieved before editing
 * @param newData         The data containing changes from the user
 */
export const computedNestedFieldsToUpdate =
    (idList: IDObject[], previousData: any, newData: any): any => {
  const ids = idList.map(obj => obj.id);
  return ids.map((id) => ({
    data: objectDifferentiation(
      objectFinder(previousData, id),
      objectFinder(newData, id)),
    where: {id}}))
      .filter(hasData)
};

/**
 * Calculate the difference between two objects.
 *
 * Based on the left object determine what fields have changed on the
 * right side object. We do not check for the ID value as these are
 * always the same so they're handled by the logic here.
 *
 * @param left    Object for comparison to
 * @param right   The object to get the difference from
 */
const objectDifferentiation = (left: any, right: any): object => {
  // return if the objects are identical
  if(left === right) return {};
  const output = _.mapValues(left, (data, name) => {
    if(right[name] === data) return undefined;
    // TODO: Handle possibility for deep nesting
    if(data.constructor === Object) return undefined;
    if(data.constructor === Array) return undefined;
    else return right[name]
  });
  Object.keys(output).forEach(key => output[key] === undefined && delete output[key])
  return output
};

/**
 * Find an object in an array of object by its ID value.
 *
 * Does assume the values inserted here posses an ID object in their body.
 *
 * @param array     Array of objects to find the specified value in
 * @param idValue   The ID to search for
 */
function objectFinder(array: object[], idValue: string) {
  return array.find((obj: any) => obj['id'] && obj['id'] === idValue)
}

/**
 * Checks for an empty object.
 *
 * @param object  The object to check against.
 */
function hasData(object: {data: object, where: {id: string}}){
  return Object.keys(object.data).length !== 0
}