/*
Opera-like mouse button history navigation

Copyright Frank Klein, 2013

This file is part of "Opera-like mouse button history navigation".

"Opera-like mouse button history navigation" is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

"Opera-like mouse button history navigation" is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
License for more details.

You should have received a copy of the GNU General Public License along with
"Opera-like mouse button history navigation". If not,
see http://www.gnu.org/licenses/.
*/

var suppressContextMenu = false

// when a new page is loaded, we need to know as fast as possible whether to
// suppress the context menu or not
chrome.storage.local.get('suppressContextMenu', handleSuppressContextMenuState)

window.addEventListener('mousedown', onMouseDown)
window.addEventListener('mouseup', onMouseUp)
window.addEventListener('contextmenu', onContextMenu)

chrome.storage.onChanged.addListener(handleStorageChange)

//
// Background script communication
//

// From content script to background
function sendEventMessageToBackground(event) {
	// inform the background script that an event occured
	chrome.runtime.sendMessage({event: event}, handleEventMessageResponse)
}

function handleEventMessageResponse(response) {
	// handle the response on an event of the background script
	console.log(response.message);
	if (response.action == "back") {
		history.back()
	}
	else if (response.action == "forward") {
		history.forward()
	}
}

function handleSuppressContextMenuState(state) {
	console.log("storage: suppressContextMenu state is " + state["suppressContextMenu"])
	if (state["suppressContextMenu"]) {
		suppressContextMenu = state["suppressContextMenu"]
	}
}

function handleStorageChange(changes, namespace) {
	// The background script decides whether to suppress the context menu
	// if changes the storage item changes, the content script adopts the change
	/*
	for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
  */
  if ("suppressContextMenu" in changes) {
	suppressContextMenu = changes["suppressContextMenu"].newValue
  }
}

//
// content event handlers
//
function onMouseDown(e) {
	if (e.button == 0) {
		sendEventMessageToBackground("left_down")
	}
	else if (e.button == 2) {
		sendEventMessageToBackground("right_down")
	}
}

function onMouseUp(e) {
	if (e.button == 0) {
		sendEventMessageToBackground("left_up")
	}
	else if (e.button == 2) {
		sendEventMessageToBackground("right_up")
	}
}

function onContextMenu(event) {
    if (suppressContextMenu) {
		event.preventDefault()
	    event.stopPropagation()
		console.log("Suppressed Context Menu")
	    return false
	}
};
