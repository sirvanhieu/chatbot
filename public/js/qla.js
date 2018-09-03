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
		url: "getListPic?psid="+document.getElementById("psid").value,
		data: objMember,
		success: function (data) {
			console.log('success');
			objMember = data;
			//document.getElementById("lblCount").innerHTML = 'Số lượng hội viên đã cập nhật ' + objMember.length + '/736';
			drawTable(data);
		},
	    error: function(error){
		 	console.log(error);
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
			
				strRow= strRow+ ' <td scope="col" width="60%" height="250px" style="text-align: center;align:center"><img src="'+obj.ImgUrl+'" alt="Ảnh dự thi" height="240px"></td>';
			
			strRow= strRow+ ' <td scope="col" width="25%">';
			strRow= strRow+ '<b >Nội dung: '+ obj.Description+'</b>';
			strRow= strRow+ '<br><b>Hashtag: '+ obj.Hashtag+'</b>';
			strRow= strRow+ '<br><b>Mã ảnh: '+ obj.KeyId+'</b></td>';
		   
			strRow= strRow+ '<td scope="col" width="15%" style="text-align: center;align:center"><br><b>Vote: '+ obj.Vote+'</b></td></td>';
			strRow= strRow+'</tr>';
		    row.innerHTML=strRow;
	}
	document.getElementById("dvMemberList").appendChild(table);
};

//getInfo();
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



