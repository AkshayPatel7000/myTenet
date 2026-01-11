import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View, I18nManager} from 'react-native';

import {RectButton, Swipeable} from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export default class Swipable extends Component {
  renderRightActions = (progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [0, 0],
      outputRange: [-50, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton style={[styles.rightAction]} onPress={this.close}>
        <AnimatedIcon
          name="check-all"
          size={30}
          color={'#FFF'}
          style={[styles.actionIcon]}
        />
      </RectButton>
    );
  };
  updateRef = ref => {
    this._swipeableRow = ref;
  };
  close = () => {
    this._swipeableRow.close();
  };
  render() {
    const {children, onSwipe, item} = this.props;

    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        rightThreshold={10}
        renderRightActions={(progress, dragX) => {
          this.renderRightActions(progress, dragX, item);
        }}
        // onEnded={() => {
        //   // onSwipe();
        //   // this._swipeableRow.close();
        // }}
      >
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
  },
  rightAction: {
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#3BBB57',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
