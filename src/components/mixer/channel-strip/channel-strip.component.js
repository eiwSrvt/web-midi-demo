'use strict';

import './channel-strip.scss';

import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

import SoundMeterComponent from '../sound-meter/sound-meter.component.js';
import MidiDeviceOptionsComponent from 'components/midi-device-options/midi-device-options.component.js';

import mixer from 'root/services/mixer.js';
import store from 'root/store.js';
import * as actions from 'root/actions.js';

function levelToPercent(value) {
  return value;
}

function maxToHeight(value) {
  return (100 - value) + '%';
}

export default React.createClass({

  getInitialState() {
    return {
      channel: mixer.getChannelById(this.props.id),
      gain: {
        left: 0,
        right: 0,
      },
      max: {
        left: maxToHeight(levelToPercent(0)),
        right: maxToHeight(levelToPercent(0)),
      },
    };
  },

  componentDidMount() {
    const channel = this.state.channel;
    channel.analyser(this.analyserCallback.bind(this));
  },

  componentWillUnmount() {
    const channel = this.state.channel;
    channel.removeAnalyserCb(this.analyserCallback.bind(this));
  },

  analyserCallback(gain, max) {
    this.setState({
      channel: this.state.channel,
      gain: {
        left: levelToPercent(gain.left) + '%',
        right: levelToPercent(gain.right) + '%',
      },
      max: {
        left: maxToHeight(levelToPercent(max.left)),
        right: maxToHeight(levelToPercent(max.right)),
      }
    });
  },

  changeGain(e) {
    // const value = e.target.value;
    // if (Boolean(Number(value))) {
    //   const gain = Number(value);
    //   if (gain >= 0 && gain <= 1) {
    //     console.log(gain);
    //     // doit here
    //   }
    // }
  },

  muteHandler() {
    this.state.channel.mute();
  },

  deleteHandler(id) {
    store.dispatch(actions.mixer.removeChannel(this.state.channel.id));
  },

  render() {
    const selected = this.props.selected;
    const selectChannelHandler = this.props.selectChannel;

    const channel = this.state.channel;
    const levels = this.state.gain;
    const maxLevels = this.state.max;
    const label = channel.label;
    const gainValue = channel.gainValue;
    const muteOn = channel.isMute;
    const midiOn = Boolean(channel.midiDevice);

    return (
      <div className={'animated fadeIn channel-strip' +
        ((label === 'master') ? ' master' : '') +
        ((selected) ? ' selected' : '')}>
        <div className="label"
          onClick={(label !== 'master') ? selectChannelHandler.bind(null, channel.id) : ''}>
          {label}
        </div>

        {(() => {
          if (label === 'master') return;
          return (
            <div className="instruments-choices">
              Keyboard
            </div>
          );
        })()}

        <div className="sound-meter">
          <div className="controls">
            <div className="gain item">
              <div className="title">
                {gainValue || 'value'}
              </div>
              <input type="text" placeholder="gain"
                onChange={this.changeGain}/>
            </div>

            {(() => {
              if (label === 'master') return;
              return (
                <div className="midi item">
                  <div className="title">
                    <div className={'midi-indicator' + ((midiOn) ? ' on' : '')}>
                    </div>
                    Midi
                  </div>
                  <MidiDeviceOptionsComponent>
                  </MidiDeviceOptionsComponent>
                </div>
              );
            })()}

            <div className="end">
              <div className={'item button mute' + ((muteOn) ? ' on' : '')}
                onClick={this.muteHandler}>
                Mute
              </div>
            </div>
          </div>

          <div className="level-bars">
            <div className="level-indicator">
              <div className="level-indicator-max-bar" style={{
                transform: `translate(0, ${maxLevels.left})`
              }}>
              </div>
              <div className="level-indicator-bar" style={{
                height: levels.left,
              }}>
              </div>
            </div>
            <div className="level-indicator">
              <div className="level-indicator-max-bar" style={{
                transform: `translate(0, ${maxLevels.right})`
              }}>
              </div>
              <div className="level-indicator-bar" style={{
                height: levels.right,
              }}>
              </div>
            </div>
          </div>
        </div>

        {(() => {
          if (label === 'master') return;
          return (
            <div className="delete"
              onClick={this.deleteHandler}>
              Delete
            </div>
          );
        })()}
      </div>
    );
  },

});
