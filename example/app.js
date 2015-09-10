'use strict';

import React, {Component} from 'react';
import Animated from '../src';

export class App extends Component{
  state = {
    anim : new Animated.Value(0)
  }
  onClick = () => {
    Animated.timing(this.state.anim, {toValue: 400}).start();
  }
  render(){
    return <Animated.div
      style={{left: this.state.anim}}
      className='circle'
      onClick={this.onClick}>
        click me
    </Animated.div>
  }
}