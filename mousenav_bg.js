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

// to suppress the context menu even after a page reload - which happens when
// history.back() and history.forward() are used, we need to keep track whether
//
chrome.storage.local.set({'suppressContextMenu': false})
var buttonDown = ({left:false, right:false})
var action = null
var suppressContextMenu = false

chrome.runtime.onMessage.addListener(handleMessage)

function handleMessage(request, sender, sendResponse) {
    console.log("from a content script:" + sender.tab.url)
    action = null

    if (request.event == "left_down") {
	buttonDown.left = true
	if (buttonDown.right) {
	    action = "back"
	    suppressContextMenu = true
	    chrome.storage.local.set({'suppressContextMenu': true})
	}
    }
    else if (request.event == "left_up") {
	    buttonDown.left = false
    }
    else if (request.event == "right_down") {
	    buttonDown.right = true
	    if (buttonDown.left) {
		    action = "forward"
	    	    chrome.storage.local.set({'suppressContextMenu': true})
	    }
    }
    else if (request.event == "right_up") {
	    buttonDown.right = false
    }
    else if (request.event == "onContextMenu") {

    }

    sendResponse({message: request.event + " caused action: " + action,
				    action: action,
				    suppressContextMenu : suppressContextMenu
    })

    console.log("button left state is  " + (buttonDown.left ? "down" : "up"))
    console.log("button right state is  " + (buttonDown.right ? "down" : "up"))

    if (!buttonDown.left && !buttonDown.right) {
	setTimeout(function() {chrome.storage.local.set({'suppressContextMenu': false})}, 1000)
    }
}
