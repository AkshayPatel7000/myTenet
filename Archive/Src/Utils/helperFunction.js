import {showMessage} from 'react-native-flash-message';
import {request} from 'react-native-permissions';
import {Alert, Linking, Platform} from 'react-native';
import {useCallback} from 'react';

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
    if (input?.length == 0) {
      return false;
    }
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

const sendWhatsAppMessage = (text, phone) => {
  let link = 'whatsapp://send?text=' + text + '&phone=' + `+91${phone}`;

  if (link) {
    Linking.openURL(link)
      .then(supported => {
        console.log(
          '🛺 ~ file: Helper.js:390 ~ sendWhatsAppMessage ~ supported:',
          supported,
        );
        if (!supported) {
          Alert.alert(
            'Please install whatsapp to send direct message to Developer via whats app',
          );
        } else {
          return Linking.openURL(link);
        }
      })
      .catch(err => {
        Alert.alert(
          'Please install whatsapp to send direct message to Developer via whats app',
        );
      });
  } else {
    Alert.alert(
      'Please install whatsapp to send direct message to Developer via whats app',
    );
    console.log('sendWhatsAppMessage -----> ', 'message link is undefined');
  }
};
const onSendSMSMessage = async (message, phoneNumber) => {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = `sms:${phoneNumber}${separator}body=${message}`;
  await Linking.openURL(url);
};
const onOpenDialer = phone => Linking.openURL(`tel:${phone}`);
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
  sendWhatsAppMessage,
  onSendSMSMessage,
  onOpenDialer,
};
