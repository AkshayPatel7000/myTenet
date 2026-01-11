import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width="60px"
      height="60px"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        fill="#663399"
        d="M440 424V88h-88V13.005L88 58.522V424H16v32h86.9L352 490.358V120h56v336h88v-32zm-120 29.642l-200-27.586V85.478L320 51z"
        className="ci-primary"
      />
      <Path fill="#663399" className="ci-primary" d="M256 232H288V296H256z" />
    </Svg>
  );
}

export default SvgComponent;
