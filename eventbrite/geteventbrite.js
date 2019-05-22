/**
 * Copyright 2018 OPEN-EYES S.r.l.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

//var request = require('request');

module.exports = function (RED) {
	"use strict";
    var request = require("request");

	function GetEventbrite(config) {
		RED.nodes.createNode(this,config);
		this.apikey = config.apikey;
        this.orgid = config.orgid;
        this.maxev = Number(config.maxev);
		var node = this;

        node.on('input', function(msg) {
            node.status({fill: "blue", shape: "dot", text: "req"});

            var url = "https://www.eventbriteapi.com/v3/events/search/?token="+
                node.apikey + "&organizer.id=" + node.orgid + "&expand=venue";

            request({
                method: 'GET',
                url: url,
            }, function (error, response, body) {
                if (error) {
                    node.status({fill: "red", shape: "dot", text: "fail"});
                    console.log('geteventbrite error:', error); // Print the error if one occurred
                } else {
                    if (response.statusCode==200) {
                        node.status({});
                        var msg = JSON.parse(body);

                        var nevt = msg.pagination.object_count;
                        var more = msg.pagination.has_more_items;

                        if (nevt>node.maxev)
                            nevt=node.maxev;

                        if (msg.pagination.has_more_items) {
                            console.log('geteventbrite too much event');
                            node.status({fill: "red", shape: "dot", text: "more items"});
                        } else {
                            if (nevt) {
                                var i;
                                for (i = 0; i < nevt; i++) {
                                    node.send({payload: msg.events[i]});
                                }
                            }
                            //msg.events.forEach(function(element) {
                            //    node.send({payload: element});
                            //});

                        }
                    } else {
                        node.status({fill: "red", shape: "dot", text: response.statusCode});
                        console.log('geteventbrite statusCode:', response && response.statusCode); // Print the response status code if a response was received                    }
                    }
                }
            });



        });


	}

	RED.nodes.registerType("get-eventbrite", GetEventbrite);
}
