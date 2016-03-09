//Constants
var pub_key = "pub-c-913ab39c-d613-44b3-8622-2e56b8f5ea6d";
var sub_key = "sub-c-8ad89b4e-a95e-11e5-a65d-02ee2ddab7fe";
var MAX_HISTORY_FETCH_LIMIT = 30; //In Minutes
var MAX_HISTORY_SAMPLE_LIMIT = 60; //Number of samples
var BUTTON_TXT_TREND = 'Trend';
var BUTTON_TXT_COUNTER = 'Counter';
var trend_graph = new Array();
//Counter Display State , to indicate if the current state of display is counter or trend
var counterDisplayState = {
        'EUR'   : true,
        'AUD'   : true,
        'CYN'   : true,
        'INR'   : true
};

var trend_graph = {
 
    'EUR'   : null,
    'AUD'   : null,
    'CYN'   : null,
    'INR'   : null
    
};

//YOUR PUBNUB KEYS - Replace the publish_key and subscribe_key below with your own keys
var pubnub = PUBNUB.init({
    publish_key: pub_key,
    subscribe_key: sub_key
});

//OnCLick trigger for Trend/Counter Button
var sendRequest = function(idx,mins){
    pubnub.publish({
        channel : 'exchangedata',
        message : '{\"name\":\"' + idx + '\",\"backtime\":' + mins + ',\"channel\":\"privateChannel\"}'
    });
}

var updatePrice = function(message){
	if(counterDisplayState[message.name] == true){
		$('#' + message['name']).html(message['value'])
        displayDeltaDirectionArrow(message['name'],message['change']);
        var date = new Date(message['time'] * 1000);
    	var timeString = date.getUTCHours().toString() + ":" + date.getUTCMinutes().toString() + ":" + date.getUTCSeconds().toString();
    	$('#' + message['name'] + '-time' ).html(timeString);
	}
	else{
		if(trend_graph[message.name] != null){
			trend_graph[message.name].shift();
			trend_graph[message.name].push(message.value);
			$('#'+message.name).sparkline(trend_graph[message.name])
			displayDeltaDirectionArrow(message['name'],message['change']);
			var date = new Date(message['time'] * 1000);
    		var timeString = date.getUTCHours().toString() + ":" + date.getUTCMinutes().toString() + ":" + date.getUTCSeconds().toString();
    		$('#' + message['name'] + '-time' ).html(timeString);
    		$('[data-index='+message.name+']').text(BUTTON_TXT_COUNTER);
		}
		else if($('[data-index='+message.name+']').text() == "Loading.."){
			try{
				sendRequest(message.name,MAX_HISTORY_FETCH_LIMIT)
			}
			catch(err){
				console.log(err)
			}
		}
	}
};

var updateChart = function(message){
	if(counterDisplayState[message.name] == false){
		trend_graph[message['name']] = message['value'];
		$('#'+message.name).sparkline(trend_graph[message.name])
		$('[data-index='+message.name+']').text(BUTTON_TXT_COUNTER);
	}
};

var displayDeltaDirectionArrow = function(idx,delta){
    
    //Update Delta Direction
    if('+' == delta.charAt(0)) {
        if( $('#' + idx + '-dir' ).hasClass('triangle-down')) {
            $('#' + idx + '-dir' ).removeClass('triangle-down');
            $('#' + idx + '-dir' ).addClass('triangle-up');
        }
        if(! $('#' + idx + '-dir' ).hasClass('triangle-up')) {

            $('#' + idx + '-dir' ).addClass('triangle-up');
        }
    } else if ('-' == delta.charAt(0)) {
        if( $('#' + idx + '-dir' ).hasClass('triangle-up')) {
            $('#' + idx + '-dir' ).removeClass('triangle-up');
            $('#' + idx + '-dir' ).addClass('triangle-down');
        }
        if(! $('#' + idx + '-dir' ).hasClass('triangle-down')) {
            $('#' + idx + '-dir' ).addClass('triangle-down');
        }
    }
    //Update Delta Value
    $('#' + idx + '-delta' ).html(delta.substr(1));
};

$(document ).ready(function() {
	pubnub.subscribe({
	    channel: 'exchangedata',
	    message: updatePrice
	});

	pubnub.subscribe({
	    channel: 'privateChannel',
	    message: updateChart
	});

	$('button').click(function(){
        if($(this).text() == BUTTON_TXT_TREND){
            //If the Button text is 'Trend' , send request to fetch historical values 
            $(this).text('Loading..');
            sendRequest($(this).data('index'),MAX_HISTORY_FETCH_LIMIT);
            counterDisplayState[$(this).data('index')] = false;
        } else if($(this).text() == BUTTON_TXT_COUNTER) {
            //Change the text
            counterDisplayState[$(this).data('index')] = true;
            $(this).text(BUTTON_TXT_TREND);
        }
    });
});