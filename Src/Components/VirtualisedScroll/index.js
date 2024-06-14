import React from 'react';
import {FlatList} from 'react-native';

const VirtualizedScrollView = props => {
  return (
    <FlatList
      {...props}
      data={[]}
      keyExtractor={(e, i) => 'dom' + i.toString()}
      ListEmptyComponent={null}
      renderItem={null}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={() => <>{props.children}</>}
    />
  );
};

export default VirtualizedScrollView;
