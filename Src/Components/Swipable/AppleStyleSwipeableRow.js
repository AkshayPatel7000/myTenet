import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View, I18nManager} from 'react-native';

import {RectButton, Swipeable} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const AnimatedIcon = Animated.createAnimatedComponent(Icon);
export default class AppleStyleSwipeableRow extends Component {
  renderRightAction = (text, color, x, progress) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      this.close();
      this.props.onSwipe();
    };
    return (
      <Animated.View
        style={{
          flex: 1,
          transform: [{translateX: 0}],
        }}>
        <RectButton
          style={[styles.rightAction, {backgroundColor: color}]}
          onPress={pressHandler}>
          <AnimatedIcon
            name="delete"
            size={30}
            color={'#FFF'}
            style={[styles.actionText]}
          />
        </RectButton>
      </Animated.View>
    );
  };
  renderRightActions = progress => (
    <View
      style={{
        borderRadius: 10,

        width: 100,
        height: '100%',
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      }}>
      {this.renderRightAction('More', '#dd2c00', 10, progress)}
    </View>
  );
  updateRef = ref => {
    this._swipeableRow = ref;
  };
  close = () => {
    this._swipeableRow.close();
  };
  render() {
    const {children, style} = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={1}
        rightThreshold={40}
        renderRightActions={this.renderRightActions}
        containerStyle={style}>
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#497AFC',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    // padding: 10,
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
