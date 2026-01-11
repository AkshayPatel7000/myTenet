import React from 'react';
import {View, Text} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export default function DatePiker() {
  const [inputDate, setInputDate] = React.useState(undefined);

  return (
    <SafeAreaProvider>
      <View style={{}}>
        <DatePickerInput
          locale="en"
          label="Start Date"
          value={inputDate}
          onChange={d => setInputDate(d)}
          inputMode="start"
        />
      </View>
    </SafeAreaProvider>
  );
}
