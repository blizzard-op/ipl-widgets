basepath = ""
basepath = "http://esports.ign.com/addons/ipl-widgets/schedule/" if local?

iplSchedule =
  init: (config) ->
    this.loadStyleSheet()
    fetchingSchedule = this.fetchUrl "schedule"
    fetchingFranchises = this.fetchUrl "franchises"

    fetchingSchedule.fail (a, b, c)->
      console.log a, b, c

    fetchingFranchises.fail (a, b, c)->
      console.log a, b, c

    $.when(fetchingSchedule, fetchingFranchises).done (scheduleData, franchiseData) =>
      schedule = this.buildSchedule scheduleData[0], franchiseData[0]
      date = this.buildDates()
      games = this.buildGames scheduleData[0], franchiseData[0]

      $("#schedule").html(date + games)

  getGameTitle: (matchObj) ->
    title = match_Obj.title;

  getMatchDate: (matchObj) ->
    matchStart = matchObj.starts_at
    matchEnd = matchObj.ends_at

  fetchUrl: (type) ->
    $.ajax({
      url: "http://esports.ign.com/" + type + ".json"
      dataType: "jsonp"
      cache: true
      jsonpCallback: "getCached" + type
    })

  buildGames: (scheduleData, franchiseData) ->
    gameList = "<ul class='games'>"
    gameList += "<li class='times'><p>Times for your time zone</p></li>"
    for franchise in franchiseData
      for own game, value of scheduleData
        if game is franchise.slug
          calid = "1u5m1559a5rlih3tr8jqp4kgac" if game is "starcraft-2"
          calid = "igpia9kc2fst1ijkde1avplkq0" if game is "league-of-legends"
          gameList += "<li class='gameHeader " + franchise.slug + "'><h3><a href='/ipl/" + franchise.slug + "'>" + franchise.name + "</a></h3><a href='https://www.google.com/calendar/embed?src=" + calid + "%40group.calendar.google.com' class='outbound-link fullCal'>Full Calendar</a></li>"
    gameList += "</ul>"

  buildDates: () ->
    dateList = "<ul>"
    i = 0
    while i < 7
      day = moment().local().add("days", i)
      dayText = day.format("dddd")
      monthText = day.format("MMMM")
      monthDateText = day.format("Do")
      today = if i is 0 then "today" else ""
      dateList += "<li class='" + dayText.toLowerCase() + " clearfix " + today + "'><time><span>" + dayText + "</span><br />" + monthText + ", " + monthDateText + "</time></li>"
      i++

    dateList += "</ul>"

  buildSchedule: (scheduleData, franchiseData) ->
    for franchise in franchiseData
      for own game, value of scheduleData
        if game is franchise.slug
          broadcastList = "<ul class='" + franchise.slug +" schedule'>"
          while i < 7
            day = moment().local().eod().add("days", i)
            broadcastList += "<li><ul>"
            broadcastList += day
            broadcastList += "</ul></li>"
            i++
          broadcastList += "</li></ul>"

  loadStyleSheet: () ->
    head = document.getElementsByTagName( 'head' )[0]
    link = document.createElement 'link' 
    link.setAttribute 'href', basepath + 'css/schedule.css'
    link.setAttribute 'rel', 'stylesheet' 
    head.appendChild link

if scheduleConfig?
  iplSchedule.init scheduleConfig
else
  iplSchedule.init()