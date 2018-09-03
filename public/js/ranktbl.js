// JavaScript Document
var objMember;
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
//var approvedId = document.getElementById("psid").value;
//document.getElementById('html').style.zoom = '70%';
function getParamValue(param) {
    var urlParamString = location.search.split(param + "=");
    if (urlParamString.length <= 1) 
	{
		return "";
	}
    else {
        var tmp = urlParamString[1].split("&");
        return tmp[0];
    }
};
//////////////////////
function getInfo() {
//	var level = getParamValue("l");
//	var layer = getParamValue("la");
//	var provincial = getParamValue("p");
//	var districts = getParamValue("d");
//	var wards = getParamValue("w");
	//var objMember;

	$.ajax({
		type: 'POST',
		dataType: "json",
		url: "/getListMember?psid="+document.getElementById("psid").value,
		data: objMember,
		success: function (data) {
			objMember = data;
			//document.getElementById("lblCount").innerHTML = 'Số lượng hội viên đã cập nhật ' + objMember.length + '/736';
			drawTable(data);
		}
	});
}

function drawTable(objMembers) {

	var table = document.createElement("table");
	table.setAttribute("width", "100%");
	table.setAttribute("class", "demo-table");
	
	
	for (var i = 0; i < objMembers.length; i++) {
		obj=objMembers[i];
		//var date= new Date(obj.Birthday);
		//var birthday = date.getDate()+'/'+(date.getMonth() + 1)+'/'+date.getFullYear();
		var row = table.insertRow(i);
		var strRow='<tr>';
			strRow= strRow+ ' <td scope="col" width="40%"><b>' + obj.Name + '</b></td>';
			
			strRow= strRow+ ' <td scope="col" width="30%"><b>' + obj.Pic + '</b></td>';
			strRow= strRow+ ' <td scope="col" width="30%"><b>' + obj.Vote + '</b></td>';
			
		
			strRow= strRow+'</tr>';
		    row.innerHTML=strRow;
	}
	document.getElementById("dvMemberList").appendChild(table);
};

$(document).ready(function(){
if(!isMobile.any())	{
		var width = document.getElementById('dvMain').offsetWidth;
					var height = document.getElementById('dvMain').offsetHeight;
					var windowWidth = $(document).outerWidth();
					var windowHeight = $(document).outerHeight();
					var r = 1;
					r = Math.min(windowWidth / width, windowHeight / height)
					if(r>=1)
					r = 0.7;
					$('#dvMain').css({
						'-webkit-transform': 'scale(' + r + ')',
						'-moz-transform': 'scale(' + r + ')',
						'-ms-transform': 'scale(' + r + ')',
						'-o-transform': 'scale(' + r + ')',
						'transform': 'scale(' + r + ')'
					});
	}

});



