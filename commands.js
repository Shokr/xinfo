var util = util || {};
util.toArray = function(list) {
  return Array.prototype.slice.call(list || [], 0);
};

var Terminal = Terminal || function(cmdLineContainer, outputContainer) {
  window.URL = window.URL || window.webkitURL;
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

  var cmdLine_ = document.querySelector(cmdLineContainer);
  var output_ = document.querySelector(outputContainer);

  const CMDS_ = [
    'clear', 'clock', 'date', 'echo', 'help', 'location', 'ip',
    'reload', 'screen', 'network', 'device' , 'battery','media',
    'browser', 'fingerprint'
  ];
  
  var fs_ = null;
  var cwd_ = null;
  var history_ = [];
  var histpos_ = 0;
  var histtemp_ = 0;

  window.addEventListener('click', function(e) {
    cmdLine_.focus();
  }, false);

  cmdLine_.addEventListener('click', inputTextClick_, false);
  cmdLine_.addEventListener('keydown', historyHandler_, false);
  cmdLine_.addEventListener('keydown', processNewCommand_, false);

  //
  function inputTextClick_(e) {
    this.value = this.value;
  }

  //
  function historyHandler_(e) {
    if (history_.length) {
      if (e.keyCode == 38 || e.keyCode == 40) {
        if (history_[histpos_]) {
          history_[histpos_] = this.value;
        } else {
          histtemp_ = this.value;
        }
      }

      if (e.keyCode == 38) { // up
        histpos_--;
        if (histpos_ < 0) {
          histpos_ = 0;
        }
      } else if (e.keyCode == 40) { // down
        histpos_++;
        if (histpos_ > history_.length) {
          histpos_ = history_.length;
        }
      }

      if (e.keyCode == 38 || e.keyCode == 40) {
        this.value = history_[histpos_] ? history_[histpos_] : histtemp_;
        this.value = this.value; // Sets cursor to end of input.
      }
    }
  }

  //
  function processNewCommand_(e) {

    if (e.keyCode == 9) { // tab
      e.preventDefault();
      // Implement tab suggest.
    } else if (e.keyCode == 13) { // enter
      // Save shell history.
      if (this.value) {
        history_[history_.length] = this.value;
        histpos_ = history_.length;
      }

      // Duplicate current input and append to output section.
      var line = this.parentNode.parentNode.cloneNode(true);
      line.removeAttribute('id')
      line.classList.add('line');
      var input = line.querySelector('input.cmdline');
      input.autofocus = false;
      input.readOnly = true;
      output_.appendChild(line);

      if (this.value && this.value.trim()) {
        var args = this.value.split(' ').filter(function(val, i) {
          return val;
        });
        var cmd = args[0].toLowerCase();
        args = args.splice(1); // Remove cmd from arg list.
      }

      switch (cmd) {
        case 'clear':
          output_.innerHTML = '<img align="left" src="y.png" width="100" height="100" style="padding: 18.1px 10px 20px 0px"><h2 style="letter-spacing: 4px">X INFO</h2><p>' + new Date() + '</p><p>Enter "help" for more information.</p>';
          this.value = '';
          return;
        case 'c':
          output_.innerHTML = '<img align="left" src="y.png" width="100" height="100" style="padding: 18.1px 10px 20px 0px"><h2 style="letter-spacing: 4px">X INFO</h2><p>' + new Date() + '</p><p>Enter "help" for more information.</p>';
          this.value = '';
          return;

        case 'clock':
          var appendDiv = jQuery($('.clock-container')[0].outerHTML);
          appendDiv.attr('style', 'display:inline-block');
          output_.appendChild(appendDiv[0]);
          break;

        case 'date':
          output( new Date() );
          break;

        case 'echo':
          output( args.join(' ') );
          break;

        case 'exit':
          window.close();
          break;

        case 'help':
          output('<div class="ls-files">' + CMDS_.join('<br>') + '</div>');
          break;

        case 'ls':
          output('<div class="ls-files">' + CMDS_.join('<br>') + '</div>');
          break;

        case 'browser':
          if (window.requestIdleCallback) {
            requestIdleCallback(function () {
                Fingerprint2.get(function (components) {
                  output("User Agent: " + components[0]['value']);
                  output("Web Driver: " + components[1]['value']);
                  output("Language: " + components[2]['value']);
                  output("Color Depth: " + components[3]['value']);
                  output("Device Memory: " + components[4]['value'] + " GB");
                  output("Hardware Concurrency: " + components[5]['value']);
                })
            })
          } else {
            setTimeout(function () {
                Fingerprint2.get(function (components) {
                  console.log(components) // an array of components: {key: ..., value: ...}
                })
              }, 500)
            }
          break;

        case 'location':
          $.getJSON('https://ipinfo.io', function(data){
            output('City:' + data['city']);
            output('Region:' + data['region']);
            output('Country:' + data['country']);
            output('Timezone:' + data['timezone']);
          });
          break;

        case 'ip':
          $.getJSON('https://ipinfo.io', function(data){
            output('Ip: ' + data['ip']);
          });
          break;

        case 'fingerprint':
          $.getJSON('http://www.devpowerapi.com/fingerprint', function(data){
            output('Fingerprint: ' + data['fingerprint']);
          });
          break;

        case 'battery':

          function updateBatteryUI(battery) {
            output("Battery Level: "+ (battery.level * 100) + '%');
            output("Charging Time: "+ battery.chargingTime + ' Seconds');
            output("Dis-charging Time: "+ battery.dischargingTime + ' Seconds');

            if (battery.charging === true) {
              output('Charging');
            } else if (battery.charging === false) {
              output('Discharging');
            }
          }

          function monitorBattery(battery) {
            // Update the initial UI.
            updateBatteryUI(battery);

            // Monitor for futher updates.
            battery.addEventListener('levelchange',
              updateBatteryUI.bind(null, battery));
            battery.addEventListener('chargingchange',
              updateBatteryUI.bind(null, battery));
            battery.addEventListener('dischargingtimechange',
              updateBatteryUI.bind(null, battery));
            battery.addEventListener('chargingtimechange',
              updateBatteryUI.bind(null, battery));
          }

          if ('getBattery' in navigator) {
            navigator.getBattery().then(monitorBattery);
          } else {
            output('The Battery Status API is not supported on this platform.');
          }
          break;

        case 'q':
          window.close();
          break;

        case 'r':
          location.reload();
        case 'reload':
          location.reload();
          break;

        case 'screen':
          // Get screen width in pixels
          let screenWidth = detect.screenWidth();
          // Get screen height in pixels
          let screenHeight = detect.screenHeight();
          // Get viewport (browser window minus any toolbars etc) width in pixels
          let viewportWidth = detect.viewportWidth();
          // Get viewport (browser window minus any toolbars etc) height in pixels
          let viewportHeight = detect.viewportHeight();
          let touchStatus = detect.touchDevice();

          output("Screen Width: "+ screenWidth);
          output("Screen Height: "+ screenHeight);
          output("viewport Width: "+ viewportWidth);
          output("viewport Height: "+ viewportHeight);
          output("Touch Screen: "+ touchStatus);

          break;

        case 'media':

          if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            output("enumerateDevices() not supported.");
            return;
          }
          // List cameras and microphones.
          navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices.forEach(function(device) {
              output(device.kind + ": " + device.label + " id = " + device.deviceId);
            });
          })
          .catch(function(err) {
            output(err.name + ": " + err.message);
          });
          break;

        case 'network':
          let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          let connection_type = connection.type;
          let connection_power = connection.effectiveType;
          let downLink = connection.downlink
          let RTT = connection.rtt

          output("Connected: "+navigator.onLine);
          output("Connection Type: " + connection_type);
          output("Connection Power: " + connection_power);
          output("Download: " + downLink + " <i>Mb/s</i>");
          output("Round-trip time: " + RTT);
          break;

        case 'device':
            (function () {
              'use strict';
              
              var module = {
                  options: [],
                  header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
                  dataos: [
                      { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
                      { name: 'Windows', value: 'Win', version: 'NT' },
                      { name: 'iPhone', value: 'iPhone', version: 'OS' },
                      { name: 'iPad', value: 'iPad', version: 'OS' },
                      { name: 'Kindle', value: 'Silk', version: 'Silk' },
                      { name: 'Android', value: 'Android', version: 'Android' },
                      { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
                      { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
                      { name: 'Macintosh', value: 'Mac', version: 'OS X' },
                      { name: 'Linux', value: 'Linux', version: 'rv' },
                      { name: 'Palm', value: 'Palm', version: 'PalmOS' }
                  ],
                  databrowser: [
                      { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
                      { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
                      { name: 'Safari', value: 'Safari', version: 'Version' },
                      { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
                      { name: 'Opera', value: 'Opera', version: 'Opera' },
                      { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
                      { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
                  ],
                  init: function () {
                      var agent = this.header.join(' '),
                          os = this.matchItem(agent, this.dataos),
                          browser = this.matchItem(agent, this.databrowser);
                      
                      return { os: os, browser: browser };
                  },
                  matchItem: function (string, data) {
                      var i = 0,
                          j = 0,
                          html = '',
                          regex,
                          regexv,
                          match,
                          matches,
                          version;
                      
                      for (i = 0; i < data.length; i += 1) {
                          regex = new RegExp(data[i].value, 'i');
                          match = regex.test(string);
                          if (match) {
                              regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
                              matches = string.match(regexv);
                              version = '';
                              if (matches) { if (matches[1]) { matches = matches[1]; } }
                              if (matches) {
                                  matches = matches.split(/[._]+/);
                                  for (j = 0; j < matches.length; j += 1) {
                                      if (j === 0) {
                                          version += matches[j] + '.';
                                      } else {
                                          version += matches[j];
                                      }
                                  }
                              } else {
                                  version = '0';
                              }
                              return {
                                  name: data[i].name,
                                  version: parseFloat(version)
                              };
                          }
                      }
                      return { name: 'unknown', version: 0 };
                  }
              };
              
              var e = module.init(),
                  debug = '';
              
              debug += 'os.name = ' + e.os.name + '<br/>';
              debug += 'os.version = ' + e.os.version + '<br/>';
              debug += 'browser.name = ' + e.browser.name + '<br/>';
              debug += 'browser.version = ' + e.browser.version + '<br/>';
              
              debug += '<br/>';
              debug += 'navigator.userAgent = ' + navigator.userAgent + '<br/>';
              debug += 'navigator.appVersion = ' + navigator.appVersion + '<br/>';
              debug += 'navigator.platform = ' + navigator.platform + '<br/>';
              debug += 'navigator.vendor = ' + navigator.vendor + '<br/>';
              
              output(debug);
          }());

          break;

        default:
          if (cmd) {
            output(cmd + ': command not found');
          }
      };

      window.scrollTo(0, getDocHeight_());
      this.value = ''; // Clear/setup line for next input.
    }
  }

  //
  function formatColumns_(entries) {
    var maxName = entries[0].name;
    util.toArray(entries).forEach(function(entry, i) {
      if (entry.name.length > maxName.length) {
        maxName = entry.name;
      }
    });

    var height = entries.length <= 3 ?
        'height: ' + (entries.length * 15) + 'px;' : '';

    // 12px monospace font yields ~7px screen width.
    var colWidth = maxName.length * 7;

    return ['<div class="ls-files" style="-webkit-column-width:',
            colWidth, 'px;', height, '">'];
  }

  //
  function output(html) {
    output_.insertAdjacentHTML('beforeEnd', '<p>' + html + '</p>');
  }

  // Cross-browser impl to get document's height.
  function getDocHeight_() {
    var d = document;
    return Math.max(
        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
    );
  }

  //
  return {
    init: function() {
      output('<img align="left" src="y.png" width="100" height="100" style="padding: 0px 10px 20px 0px"><h2 style="letter-spacing: 4px">X INFO</h2><p>' + new Date() + '</p><p>Enter "help" for more information.</p>');
    },
    output: output
  }
};