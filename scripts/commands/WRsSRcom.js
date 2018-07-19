//Used script by detolly as base: (https://github.com/detolly/Phantombot-scripts/blob/master/speedruncom/speedruncom.js)
//His comments:"Code courtesy of tSparkles (https://twitch.tv/tSparkles),I do commissions for free because learning is fun"

(function () {

    /**
    * @event command
    */
    $.bind('command', function(event) {

        var command = event.getCommand();
        var sender = event.getSender();
        var arguments = event.getArguments();
        var args = event.getArgs();

        // if (command.equalsIgnoreCase('wrhelp')) {
        //     $.say("Syntax: !wr [Game name abbreviation] [Category]. If not specified, it will look for a category in the title or the game as the current game. Both arguments must be one word.");
        // }

        if (command.equalsIgnoreCase('wr')) {
            // var twitchChannelObject = getTwitchObject("https://api.twitch.tv/kraken/channels/" + channel);
            if (args.length > 0) {
                var gameName = args[0]; //yes I know this is wrong but who cares beacuse var is global scope xDDDDDDDDDDDDDDDDDDDDDDDDDD
                if (gameName == "dsr") { //hard bind for dsr to be dark souls darksoulsremastered
                  gameName = "darksoulsremastered"
                }
            } else {
                var gameName = $.getGame($.channelName);
            }
            var gameReturned = httpGet("https://www.speedrun.com/api/v1/games?name=" + gameName);
            var gameJson = JSON.parse(gameReturned)["data"];
            try {
                var gameId = gameJson[0].id;
            } catch (a) {
                $.say("Game was not found :/");
                return;
            }
            var categoryReturned = httpGet("https://www.speedrun.com/api/v1/games/" + gameId + "/categories?miscellaneous=no");
            var categoryJson = JSON.parse(categoryReturned);

            var idsToUse = [];
            for(var i = 0; i < categoryJson["data"].length; i++) {
              try {
                if (categoryJson["data"][i].type == "per-game") {
                    idsToUse[i] = categoryJson["data"][i].id;
                }
              } catch (a) {
                    $.say("Something weird happened. Found no categories??");
                    return;
              }
            }
            idsToUse = cleanArray(idsToUse);

            var runsReturned = [];
            var runsJson = [];
            var usersReturned = [];
            var usersJson = [];
            var users = [];

            for(var i = 0; i < idsToUse.length; i++) {
              runsReturned[i] = httpGet("https://www.speedrun.com/api/v1/leaderboards/" + gameId + "/category/" + idsToUse[i]);
              runsJson[i] = JSON.parse(runsReturned[i])
            }

            var seconds = [];
            var hours = [];
            var minutes = [];
            var newSeconds = [];

            for(var i = 0; i < runsJson.length; i++) {
              if (runsJson[i].data.runs[0] != undefined) {
                usersReturned[i] = httpGet("https://www.speedrun.com/api/v1/users/" + runsJson[i].data.runs[0].run.players[0].id);
                usersJson[i] = JSON.parse(usersReturned[i]);
                users[i] = usersJson[i].data.names.international;
              } else {
                users[i] = "";
              }

              if (runsJson[i].data.runs[0] != undefined) {
                seconds[i] = runsJson[i].data.runs[0].run.times.primary_t;
              } else {
                seconds[i] = 0;
              }

              hours[i] = new java.lang.String(Math.floor(seconds[i] / 3600));
              minutes[i] = new java.lang.String(Math.floor((seconds[i] / 60) % 60));
              newSeconds[i] = new java.lang.String(Math.floor(seconds[i] % 60));
              if ((newSeconds[i] + "").length == 1) newSeconds[i] = "0" + newSeconds[i];
              if ((minutes[i] + "").length == 1) minutes[i] = "0" + minutes[i];
              // if ((hours[i] + "").length == 1) hours[i] = "0" + hours[i];
            }

            var resultStr = "";
            for(var i = 0; i < idsToUse.length; i++) {
              if (seconds[i] != 0) {
                if (i>0){
                  resultStr = resultStr + " |";
                }
                // gameJson[0].names.international to get game name
                var hoursP = (hours[i]>0) ? (hours[i] + ":") : "";
                resultStr = resultStr + " " +  categoryJson["data"][i].name + " " + hoursP + minutes[i] + ":" + newSeconds[i] + " by " + users[i];
              }
            }

            $.say(resultStr);
        }
      });
    /**
     * @function httpGet
     */
    function httpGet(theUrl)
    {
        try {
        var resourceURL = new java.net.URL(theUrl);
        var urlConnection = resourceURL.openConnection();
        // urlConnection.setRequestProperty("Client-ID", client_id);
        var inputStream = new java.io.InputStreamReader(urlConnection.getInputStream());
        var bufferedReader = new java.io.BufferedReader(inputStream);
        var inputLine = bufferedReader.readLine();
        bufferedReader.close();
        var jsString = String(inputLine);
        return jsString;
        } catch(a) {
            $.say("API didn't want us to see, try again Wowee");
        }
    }

    // /**
    //  * @function getTwitchObject
    //  */
    // function getTwitchObject(url) {
    //     var resp = httpGet(url);
    //     return JSON.parse(resp);
    // }

    /**
     * @function cleanArray
     */
    function cleanArray(actual) {
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
          if (actual[i]) {
            newArray.push(actual[i]);
          }
        }
        return newArray;
    }

    /**
    * @event initReady
    */
    $.bind('initReady', function() {
        // `permission` is the group number. 0, 1, 2, 3, 4, 5, 6 and 7.
        $.registerChatCommand('./commands/WRsSRcom.js', 'wr', 7);
    });

})();
