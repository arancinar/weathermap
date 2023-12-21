//javascript.js
//set map options


var donecalculating = 0;
var myLatLng = {
    lat: 38.3460,
    lng: -0.4907
};
var mapOptions = {
    center: myLatLng,
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP

};

//create map
var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

//create a DirectionsService object to use the route method and get a result for our request
var directionsService = new google.maps.DirectionsService();

//create a DirectionsRenderer object which we will use to display the route
var directionsDisplay = new google.maps.DirectionsRenderer({
    polylineOptions: {
        strokeColor: "orange"
    }
});

//bind the DirectionsRenderer to the map
directionsDisplay.setMap(map);

const directionsarray = []

function clearMap() {
    //console.log("length:" + directionsarray[0])
    worstcondition = 0;
    for (var i = 0; i < directionsarray.length; i++) {
        directionsarray[i].set('directions', null);
    }

}
var finallat = 0;
var finallong = 0;
var worstcondition = 0;
//define calcRoute function
function calcRoute() {

  document.getElementById("overlay").style.zIndex = "1";
  document.getElementById("loadingwindow").style.zIndex = "2";
  document.getElementById("stats").style.zIndex = "2";



    clearMap()
    var from = document.getElementById("from").value;
    var to = document.getElementById("to").value;



    //create request
    var request = {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    }


    //pass the request to the route method
    var directionsbad = 0;
    var result2;


    let f = directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        document.getElementById("innertext").innerHTML = "Safe";
        document.getElementById('innertext').style.color = 'rgb(0,0,255)';

        result2 = result;
        distanceadjuster = Math.floor((result2.routes[0].legs[0].distance.value) / 500000);


        totalsteps = 5 + distanceadjuster;
      }
      else{
        document.getElementById("overlay").style.zIndex = "-1";
        document.getElementById("loadingwindow").style.zIndex = "-1";
        alert ("No route found!\n\nPlease check for spelling errors, and ensure there is a valid route between your origin and destination.");  
        throw new Error('Bad directions!');
      }
    })



    f.then(() => {
      console.log(directionsbad)
      if(directionsbad ==0){


        var thisisfirst = 1;
        var totallength = result2.routes[0].overview_path.length;

        var spacer = Math.floor(totallength / totalsteps)

        var newlat =parseFloat(result2.routes[0].overview_path[Math.floor(totallength/2)].lat());
        var newlong =parseFloat(result2.routes[0].overview_path[Math.floor(totallength/2)].lng());

        finallat =Math.round(parseFloat(result2.routes[0].overview_path[Math.floor(totallength-1)].lat()) * 100) / 100;
        finallong =Math.round(parseFloat(result2.routes[0].overview_path[Math.floor(totallength-1)].lng()) * 100) / 100;


        console.log(newlat)
        console.log(newlong)
        latandlong = {
          newlat, newlong
        }

        map.setCenter({lat:newlat, lng:newlong});
        map.setZoom(6);
        for (var i = 0; i < totallength; i++) {
            if (i % spacer == 0 || i + 1 == totallength) {
                if (thisisfirst == 1) {
                    getDirections1(result2.routes[0].overview_path[i].lat(), result2.routes[0].overview_path[i].lng(), result2.routes[0].overview_path[i].lat(), result2.routes[0].overview_path[i].lng());
                    thisisfirst = 0;
                } else {
                    getDirections1(pastlat, pastlong, result2.routes[0].overview_path[i].lat(), result2.routes[0].overview_path[i].lng());
                }
                pastlat = result2.routes[0].overview_path[i].lat();
                pastlong = result2.routes[0].overview_path[i].lng();
            }
        }
      }
     

      document.getElementById("overlay").style.zIndex = "-1";
      document.getElementById("loadingwindow").style.zIndex = "-1";
    })
    }
  
  
  




async function getDirections1(origlat, origlong, destlat, destlong) {
    var weatherurl = "https://api.open-meteo.com/v1/forecast?latitude=" + origlat + "&longitude=" + origlong + "&hourly=snowfall&past_days=1&forecast_days=1";
    var request = {
        origin: new google.maps.LatLng(origlat, origlong),
        destination: new google.maps.LatLng(destlat, destlong),
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    }

    var result2;
    let p = directionsService.route(request, function(result, status) {

        result1 = result;


    });
    p.then(() => {

        fetch(weatherurl)
            .then(res => res.json())
            .then((out) => {
                var therewassnow = 0;
                var totalsnow = 0;
                for (var i = 0; i < 48; i++) {
                    totalsnow = totalsnow + out.hourly.snowfall[i]
                }
                if (totalsnow == 0) {
                    therewassnow = 0;
                }
                if (totalsnow > 0) {
                    therewassnow = 1;
                }
                if (totalsnow > 5) {
                    therewassnow = 2;
                }
                if (totalsnow > 10) {
                    therewassnow = 3;
                }
                if (totalsnow > 15) {
                    therewassnow = 4;
                }


                switch (therewassnow) {
                    case 0:
                        var directionsDisplay = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeWeight: 5,
                                strokeColor: "blue"

                            }
                        });
                        directionsarray.push(directionsDisplay);
                        directionsDisplay.setMap(map);

                        break;
                    case 1:
                        var directionsDisplay = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeWeight: 5,
                                strokeColor: "#fdc70c"
                            }
                        });
                        if(therewassnow>worstcondition){
                          worstcondition = therewassnow;
                          console.log("worsened to 1");
                          document.getElementById("innertext").innerHTML = "Likely Safe";
                          document.getElementById('innertext').style.color = 'rgb(253,199,12)';

                        }
                        directionsarray.push(directionsDisplay);
                        directionsDisplay.setMap(map);
                        break;

                    case 2:
                        var directionsDisplay = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeWeight: 5,
                                strokeColor: "#f3903f"
                            }
                        });
                        if(therewassnow>worstcondition){
                          worstcondition = therewassnow;
                          console.log("worsened to 2");
                          document.getElementById("innertext").innerHTML = "Use Increased Caution";
                          document.getElementById('innertext').style.color = 'rgb(243,144,63)';


                        }
                        directionsarray.push(directionsDisplay);
                        directionsDisplay.setMap(map);
                        break;

                    case 3:
                        var directionsDisplay = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeWeight: 5,
                                strokeColor: "#e93e3a"
                            }
                        });
                        if(therewassnow>worstcondition){
                          worstcondition = therewassnow;
                          console.log("worsened to 3");
                          document.getElementById("innertext").innerHTML = "Use Extreme Caution";
                          document.getElementById('innertext').style.color = 'rgb(233,62,58)';



                        }
                        directionsarray.push(directionsDisplay);
                        directionsDisplay.setMap(map);
                        break;

                    case 4:
                        var directionsDisplay = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeWeight: 5,
                                strokeColor: " #000000"
                            }
                        });
                        if(therewassnow>worstcondition){
                          worstcondition = therewassnow;
                          console.log("worsened to 4");
                          document.getElementById("innertext").innerHTML = "Reconsider Travel";
                          document.getElementById('innertext').style.color = 'rgb(0,0,0)';


                        }
                        directionsarray.push(directionsDisplay);
                        directionsDisplay.setMap(map);
                        break;
                    default:
                        // code block
                }
                directionsService.route(request, function(result, status) {
                    //display route
                    directionsDisplay.setDirections(result);
                });

            })

    })
    return result2;
}