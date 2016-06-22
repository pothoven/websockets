/* jshint shadow:true */
/* jshint sub:true */


window.onload = function() {


    var titleEl                 = document.getElementById("title");
    var titleButton             = document.getElementById("title-button");

    var accountEl               = document.getElementById("account");
    var accountButton           = document.getElementById("account-button");

    var deviceListEl            = document.getElementById("deviceList");
    var deviceButton            = document.getElementById("device-button");
    var deviceAllButton         = document.getElementById("deviceAll-button");
    var deviceNoneButton        = document.getElementById("deviceNone-button");

    var id                      = document.getElementById("id");
    var longitude               = document.getElementById("longitude");
    var latitude                = document.getElementById("latitude");
    var readingButton           = document.getElementById("reading-button");

    var readingTblEl            = document.getElementById("data-table-body");
    var subscribedDeviceCountEl = document.getElementById("subdevice-value");
    var deviceCountEl           = document.getElementById("device-value");
    var readingCountEl          = document.getElementById("counter-value");


    /* callback functions provided to the client */

    function connectedTo(accountId) {
        deviceButton.disabled     = false;
        deviceAllButton.disabled  = false;
        deviceNoneButton.disabled = false;
        readingButton.disabled    = false;
    }
    
    function updateTitle(title) {
        var message = document.getElementById("message");
        message.innerHTML = title;
    }

    function updateDeviceList(deviceList, subscribedDevices) {
        deviceListEl.innerHTML = "";

        // update the device list select list, selecting currently subscribed devices
        for (var deviceId in deviceList) {
            var option = document.createElement("option");
            option.innerHTML = deviceList[deviceId];
            if (deviceList[deviceId] && subscribedDevices.indexOf(deviceList[deviceId]) > -1) {
                option.setAttribute("selected", "selected");
            }
            deviceListEl.appendChild(option);
        }

        // update counters on the page
        deviceCountEl.innerHTML           = deviceList.length;
        subscribedDeviceCountEl.innerHTML = subscribedDevices.length;
        
        // remove any device data for devices no longer subscribed to
        for (var i = (readingTblEl.children.length - 1); i >= 0; i--) {
            var deviceData = readingTblEl.children[i];
            var deviceId = deviceData.getAttribute("id").substring(5);
            if (subscribedDevices.indexOf(deviceId ) === -1) {
                readingTblEl.removeChild(deviceData);
                if (deviceMap) {
                    deviceMap.removeDevice(deviceId);
                }
            }
        }

    }
    
    function updateDevice(device, counter) {
        if (deviceMap) {
            deviceMap.markDevice(device.id, device.latitude, device.longitude, device.speed);
        }

        if (device.id) {
            var oldTR = document.getElementById("data-" + device.id);
            if (oldTR) {
                oldTR.children[1].innerHTML = device.latitude;
                oldTR.children[2].innerHTML = device.longitude;
                oldTR.children[3].innerHTML = device.speed;
                oldTR.children[4].innerHTML = device.heading;
            } else {
                var newTR = document.createElement("tr");
                newTR.setAttribute("id", "data-" + device.id);
                
                var idTD      = document.createElement("td");
                var latTD     = document.createElement("td");
                var longTD    = document.createElement("td");
                var speedTD   = document.createElement("td");
                var headingTD = document.createElement("td");

                latTD.setAttribute("class", "latitude");
                longTD.setAttribute("class", "longitude");
                speedTD.setAttribute("class", "speed");
                headingTD.setAttribute("class", "heading");
                
                idTD.innerHTML      = device.id;
                latTD.innerHTML     = device.latitude;
                longTD.innerHTML    = device.longitude;
                speedTD.innerHTML   = device.speed;
                headingTD.innerHTML = device.heading;
                
                newTR.appendChild(idTD);
                newTR.appendChild(latTD);
                newTR.appendChild(longTD);
                newTR.appendChild(speedTD);
                newTR.appendChild(headingTD);
                
                /* find proper place to insert row (sorted) */
                var added = false;
                for (var i = 0; i < readingTblEl.childElementCount; i++) {
                    oldTR = readingTblEl.children[i];
                    if (oldTR.id > newTR.id) {
                        readingTblEl.insertBefore(newTR, oldTR);
                        added = true;
                        break;
                    }
                }
                if (!added) {
                    readingTblEl.appendChild(newTR);
                }

                if (deviceMap) {
                    newTR.onclick = function() {
                        deviceMap.centerOnDevice(device.id);
                    };
                }
            }
            
            readingCountEl.innerHTML = counter;
        }
        
    }
    

    if (websocketClient) {

        websocketClient.start(updateTitle);

        if (titleButton) {
            titleButton.onclick = function() {
                updateTitle(websocketClient.changeTitle(titleEl.value));
            };
        }

        if (accountButton) {
            accountButton.onclick = function() {
                if (accountEl && accountEl.value.length > 0) {
                    websocketClient.connectToAccount(accountEl.value, connectedTo, updateDeviceList, updateDevice);
                }
            };
        }

        if (deviceButton) {
            deviceButton.onclick = function() {
                var selectedOptionEls = deviceListEl.selectedOptions;
                var devices = [];
                for (var i = 0; i < selectedOptionEls.length; i++) {
                    devices.push(selectedOptionEls[i].value || selectedOptionEls[i].text);
                }
                subscribedDeviceCountEl.innerHTML = websocketClient.subscribeToDevices(devices).length;
            };
        }

        if (deviceAllButton) {
            deviceAllButton.onclick = function() {
                var selectedOptionEls = deviceListEl.options;
                var devices = [];
                for (var i = 0; i < selectedOptionEls.length; i++) {
                    devices.push(selectedOptionEls[i].value || selectedOptionEls[i].text);
                    selectedOptionEls[i].setAttribute("selected", "selected");
                }
                subscribedDeviceCountEl.innerHTML = websocketClient.subscribeToDevices(devices).length;
            };
        }

        if (deviceNoneButton) {
            deviceNoneButton.onclick = function() {
                var selectedOptionEls = deviceListEl.selectedOptions;
                for (var i = 0; i < selectedOptionEls.length; i++) {
                    selectedOptionEls[i].removeAttribute("selected");
                }
                subscribedDeviceCountEl.innerHTML = websocketClient.subscribeToDevices([]).length;
            }
        }

        if (readingButton) {
            readingButton.onclick = function() {
                websocketClient.submitManualReading(accountEl.value,
                                                    id.value,
                                                    latitude.value,
                                                    longitude.value,
                                                    speed.value,
                                                    heading.value
                                                   );
            };
        }
        
    } else {
        console.error("WebSocketClient is not initialized");
    }

};
