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
		url: "/getListPic4vote?psid="+document.getElementById("psid").value,
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
			strRow= strRow+ ' <td scope="col" width="65%" style="text-align: center;align:center"><img src="'+obj.ImgUrl+'" alt="Ảnh dự thi" width="100%px"></td>';
			
			strRow= strRow+ ' <td scope="col" width="25%">';
			strRow= strRow+ '<b>Nội dung: '+ obj.Description+'</b>';
			strRow= strRow+ '<br><b>Hashtag: '+ obj.Hashtag+'</b>';
			strRow= strRow+ '<br><b>Mã ảnh: '+ obj.KeyId+'</b>';
			strRow= strRow+ '<br><b>Vote: '+ obj.Vote+'</b></td>';
		
			
				strRow= strRow+ '<td scope="col" width="10%"><input type="image" src="img/Accept.png" alt="Vote" onClick="VotePic(this);return false;"/></td>';
			
		
			strRow= strRow+'</tr>';
		    row.innerHTML=strRow;
	}
	document.getElementById("dvMemberList").appendChild(table);
};

function VotePic(objImg) {
	var index = objImg.parentNode.parentNode.rowIndex;
	var row =objImg.parentNode.parentNode;
	//alert(objMember[index].Phone);
	
	var objM = {};
	//objM.BlockStatus = 'ACTIVE';
	objM.PicId = objMember[index].KeyId;
	objM.IdPost = objMember[index].IdPost;
//	objM.Description =objMember[index].Description;
//	objM.Name=objMember[index].Name;
	objM.VoteId=document.getElementById("psid").value;
	//objM.ApprovedName=objMember[index].Name;
	var mess = "Bạn có muốn vote cho ảnh mã số " + objMember[index].KeyId + ", nội dung " +objMember[index].Description;
	var r = confirm(mess);
    if (r == true) {
		$.ajax({
			type: 'POST',
			data: JSON.stringify(objM),
			contentType: 'application/json',
			url: '/votepic',				
			success: function(data) 
			{
				alert(data);			
				console.log(data);
				if(data!="Thông báo: Bạn đã vote cho ảnh này")
				{
					var vc = objMember[index].Vote + 1;
					row.cells[2].innerHTML='<img src="img/ok.png" alt="Voted" />';
					row.cells[1].innerHTML='<b>Nội dung: '+ objMember[index].Description+'</b><br><br><b>Hashtag: '+ objMember[index].Hashtag+'</b><br><br><b>Mã ảnh: '+ objMember[index].KeyId+'</b><br><b>Vote: '+ vc +'</b>';
					/*row.cells[0].innerHTML='<td scope="col" width="120px" height="120px" style="text-align: center;align:center"><img src="'+objMember[index].ImgUrl+'" alt="Ảnh đại diện" height="80px" width="80px"><br><br><input type="image" src="img/cancelvn.png" alt="Hủy" onClick="CancelStatusMember(this);return false;" height="21px" width="80px"/></td>';*/
				}
			},
			error: function(err) {		 
			  alert(err.statusText);

			}
		});
	 } 
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



