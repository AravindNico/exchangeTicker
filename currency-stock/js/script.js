//Constants
    var MAX_HISTORY_FETCH_LIMIT = 30; //In Minutes
    var MAX_HISTORY_SAMPLE_LIMIT = 60; //Number of samples
    
    var BUTTON_TXT_TREND = 'Trend';
    var BUTTON_TXT_COUNTER = 'Counter';
    
    //YOUR PUBNUB KEYS - Replace the publish_key and subscribe_key below with your own keys
	var pubnub = PUBNUB.init({
	    publish_key: 'pub-c-913ab39c-d613-44b3-8622-2e56b8f5ea6d',
	    subscribe_key: 'sub-c-8ad89b4e-a95e-11e5-a65d-02ee2ddab7fe'
	});

    var privateChannel = PUBNUB.uuid();
    
    //Counter Display State , to indicate if the current state of display is counter or trend
    var counterDisplayState = {
     
            'EUR'   : true,
            'AUD'   : true,
            'CYN'   : true,
            'INR'   : true
        
    } ;
    
    //Arrays for storing history values of the indices
    var historyValues = {
     
        'EUR'   : null,
        'AUD'   : null,
        'CYN'   : null,
        'INR'   : null
        
    }
    
    
    //PubNub Callback for Price Counter Update
	var updatePrice = function(msg) {
        console.log(msg);
        data = msg
        console.log(data);
        //Update Price for the index
        
        //If the counter display state is True for this index
        if(true == counterDisplayState[data['name']] ) {
        
        
            $('#' + data['name']).html(data['value'])

            displayDeltaDirectionArrow(data['name'],data['change']);
            
                            
        } else {
        
            //Display state is currently set to Trend
            
            //Set the Price and change value
            $('#' + data['name'] + '-delta' ).html(data['value'] + '<br/>' + data['change'] )
                
            //Add the new price in Array
            if(historyValues[data['name']].length >= MAX_HISTORY_SAMPLE_LIMIT){
             
                historyValues[data['name']].shift();
            
            }
            
            historyValues[data['name']].push(data['value']);
            
            displayTrend(data['name']);
                
        }
        
        //Update Last Update Time
        var date = new Date(data['time'] * 1000);
        
        var timeString = date.getUTCHours().toString() + ":" + date.getUTCMinutes().toString() + ":" + date.getUTCSeconds().toString();
        $('#' + data['name'] + '-time' ).html(timeString);
	}
    
    //PubNub Callback for fetching historical prices 
    var updateChart = function(msg) {
        console.log(msg)

        var data = msg;
        console.log(data)
        //Index Name
        var idx = data[0]['name'];
        
        historyValues[idx] = new Array();
        
        //Populate the historical prices data in the temp array
        var tempArray = new Array();
        for (var cnt = 0 ; cnt < data.length ;cnt++) {
         
        	tempArray.push(data[cnt]);
                                           
        }
        
        tempArray.reverse();
        
        var shiftCount = tempArray.length - MAX_HISTORY_SAMPLE_LIMIT;

        if(shiftCount > 0){

        	for(var i = 0;i < shiftCount ;i++){
        		tempArray.shift();		
        	}
        }

        
        
        //Get the latest price
        var latestPrice = tempArray[tempArray.length - 1]['value'];
        var latestDelta = tempArray[tempArray.length - 1]['change'];
        
        while(tempArray.length >= 1){

        	historyValues[idx].push(tempArray.shift()['value']);
        }
        
        console.log(historyValues[idx]);

        //Set the display flag to indicate trend display
        counterDisplayState[idx] = false;
        
        

        //Remove the Trend Arrows
        if( $('#' + idx + '-dir' ).hasClass('triangle-up')) {
            $('#' + idx + '-dir' ).removeClass('triangle-up')
        }
            
        if( $('#' + idx + '-dir' ).hasClass('triangle-down')) {
            $('#' + idx + '-dir' ).removeClass('triangle-down')
        }


        //Set the Price and change value
        $('#' + idx + '-delta' ).html(latestPrice + '<br/>' + latestDelta );
        displayTrend(idx);
        
        $('[data-index='+idx+']').removeAttr('disabled');
        $('[data-index='+idx+']').text(BUTTON_TXT_COUNTER);
                    
    }
    
    //OnCLick trigger for Trend/Counter Button
    var sendRequest = function(idx,mins){
        
        pubnub.publish({
            channel : 'exchangehistory',
            message : '{' + ' "name" ' + ':' + '"' + idx + '"' + ',' + ' "backtime" ' + ':' + mins + ',' + ' "channel" ' + ':' + '"' + privateChannel + '"' + '}'
        });
        
        
    }
    
    //Display trend chart based on a new value
    var displayTrend = function(idx){
        
        $('#' + idx).sparkline(historyValues[idx], {
            type: 'line',
            chartRangeMinX: 0,
            chartRangeMaxX: MAX_HISTORY_SAMPLE_LIMIT ,
             
        });
                    
    }

    //Display trend chart based on a new value
    var displayCounter = function(idx){

    	var txt = $('#'+idx+'-delta').text();

    	var symbolIndex;

    	if(txt.indexOf('+') >= 0){

			symbolIndex =  txt.indexOf('+');       		
    	} else {

    		symbolIndex =  txt.indexOf('-');       	

    	}

    	var price = txt.substr(0,symbolIndex);
    	var delta = txt.substr(symbolIndex);

    	counterDisplayState[idx] = true;

    	$('#' + idx).html(price)

        displayDeltaDirectionArrow(idx,delta);    


    }
    
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
        
        
    }

	$( document ).ready(function() {
       	
		pubnub.subscribe({
		    channel: 'exchangedata',
		    message: updatePrice
		});
        console.log(updatePrice)
        pubnub.subscribe({
		    channel: privateChannel,
		    message: updateChart
		});
        console.log(updateChart)

        $('button').click(function(){
          
            
            if(BUTTON_TXT_TREND == $(this).text()){
                
                //If the Button text is 'Trend' , send request to fetch historical values 
                
                sendRequest($(this).data('index'),MAX_HISTORY_FETCH_LIMIT);
                
                $(this).attr('disabled','disabled');
                $(this).text('Loading..');
                
            } else {
            
                //Change the text
                $(this).text(BUTTON_TXT_TREND);
                displayCounter($(this).data('index'));
                
            }
            
            
        });
        
        // var myvalues = [6110,6118,6115,6117,6114,6114,6111,6110,6113,];
        // $('#INR').sparkline(myvalues);
        // var myvalues = [6110,6118,6115,6117,6114,6114,6111,6110,6113,];
        // $('#CYN').sparkline(myvalues);
        // var myvalues = [6110,6118,6115,6117,6114,6114,6111,6110,6113,];
        // $('#AUD').sparkline(myvalues);
        // var myvalues = [6110,6118,6115,6117,6114,6114,6111,6110,6113,];
        // $('#EUR').sparkline(myvalues);
        
        
    });
