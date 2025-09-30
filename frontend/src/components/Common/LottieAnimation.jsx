import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LottieAnimation = ({ src, loop = true, autoplay = true, className = '', style = {} }) => {
  return (
    <div className={`lottie-animation ${className}`} style={style}>
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay}
      />
    </div>
  );
};

export default LottieAnimation;
