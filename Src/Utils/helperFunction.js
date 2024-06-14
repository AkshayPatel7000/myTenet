import {showMessage} from 'react-native-flash-message';
import {request} from 'react-native-permissions';
import {Linking, Platform} from 'react-native';

// import {NoProfile} from '../assets';

const showError = (message, duration = 1000) => {
  showMessage({
    message,
    type: 'danger',
    icon: 'danger',
    duration,
  });
};

const showSuccess = message => {
  showMessage({
    message,
    type: 'success',
    icon: 'success',
  });
};

const getColor = index => {
  switch (index) {
    case 0:
      return {backgroundColor: '#38CCAA'};
    case 1:
      return {backgroundColor: '#38A0CC'};
    case 2:
      return {backgroundColor: '#ECCF36'};
    default:
      return {backgroundColor: '#38CCAA'};
  }
};

const addColorToDataArray = (dataArray = [], colorArray = []) => {
  let count = -1;
  let tempData = dataArray.map(ele => {
    if (colorArray.length - 1 <= count) {
      count = 0;
    } else {
      count++;
    }
    return {...ele, ...colorArray[count]};
  });
  return tempData;
};

const searchByFields = (arr, input, keyArr) => {
  const results = arr?.filter(function (p) {
    if (input?.length == 0) return false;
    if (keyArr?.length > 0) {
      var data = keyArr.map(ele => p[ele]).join(' ');
      return data.match(new RegExp(input, 'i'));
    }
    return Object.values(p).join(' ').match(new RegExp(input, 'i'));
  });
  return results;
};

const urlencodedFormData = body => {
  var formBody = [];
  for (var property in body) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(body[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');
  return formBody;
};

const request_PERMISSIONS = async permission => {
  try {
    request(permission).then(result => {});
  } catch (err) {
    console.warn(err);
  }
};
const handlePriority = (data, id) => {
  const priority = data?.find(e => e?.typeId == id);
  return priority?.typeName;
};
const dialCall = number => {
  let phoneNumber = '';
  if (Platform.OS === 'android') {
    phoneNumber = `tel:${number}`;
  } else {
    phoneNumber = `telprompt:${number}`;
  }
  Linking.openURL(phoneNumber);
};
const toTitleCase = (str = '') => {
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
};

function generateUniqueId() {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function sortByTimestamp(arrayOfObjects, reverse = false) {
  function compareTimestamps(a, b) {
    return a.createdAt - b.createdAt;
  }
  function compareTimestampsReverse(a, b) {
    return b.createdAt - a.createdAt;
  }
  if (reverse) {
    arrayOfObjects.sort(compareTimestampsReverse);
  } else {
    arrayOfObjects.sort(compareTimestamps);
  }

  return arrayOfObjects;
}
function sumArrayOfObjects(array, property) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += Number(array[i][property]);
  }
  return sum;
}
export {
  addColorToDataArray,
  getColor,
  request_PERMISSIONS,
  searchByFields,
  showError,
  showSuccess,
  urlencodedFormData,
  handlePriority,
  dialCall,
  toTitleCase,
  generateUniqueId,
  sortByTimestamp,
  sumArrayOfObjects,
};
