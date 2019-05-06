$(function () {
    
    var socket = io.connect('http://192.168.1.31:4000');

    

    $("a#enterChat").click(function (e) {      
        e.preventDefault();

        let username = $('#username').val(); 

        localStorage.setItem("username", username);

        if (username != "") {
            socket.emit("username", username); 

            $('div#enteruserName').addClass('hidden');
            $('div#chatMain').removeClass('hidden');

            socket.on('users', function (data) {
                data.forEach(element => {
                    if (!$("li#" + element.socketID).length && $("div#kullanicilar li").text() != element.username) {
                        $('div#kullanicilar ul').append('<li id="' + element.socketID + '">' + element.username + '</li>');

                    }
                });
            });

        } else {
            alert('Bir kullanıcı adı girmelisiniz!');
        }

    });

    

    socket.on('guncelonline',function (data) {
        if(data.username == localStorage.getItem("username"))
        {
            return;
        }else{
            $('div#kullanicilar ul').append('<li id="' + element.socketID + '">' + element.username + '</li>');

        }
        
    });


    $("input#username").keypress(function (e) {
        let username = $("#username").val();

        if (e.which == 13) {
            if (username != "") {
                $("a#enterChat").click();
            } else {
                alert('Bir kullanıcı adı girmelisin!');
            }
        }
    })



   

    socket.on("logon", function (data) {
        $('div#kullanicilar ul').append('<li id="' + data.socketID + '">' + data.username + '</li>');
    });
    
    socket.on("logoff", function (id) {
        
        localStorage.removeItem("username");
    });

    

    $("#chatText").keypress(function (e) {
        if (e.which == 13) {
            let mesaj = $("#chatText").val();
            let ekranID = $("div#chatEkrani div.active").attr('id');
            let publicChat = true;
            let ikinci_kullaniciadi = false;
            let ikinci_kullanici_ID;
            let data;

           
            if (mesaj != "") {

                if (!($("#genelChatEkrani").hasClass('active'))) {
                    publicChat = false;
                    let usersDiv = $("div.chatroom.active").attr('id');
                    let userArray = usersDiv.split("-");

                    ikinci_kullaniciadi = userArray[1];
                    ikinci_kullanici_ID = $("li:contains(" + ikinci_kullaniciadi + ")").attr('id');

                    if (!ikinci_kullanici_ID) {
                        ikinci_kullaniciadi = userArray[0];
                        ikinci_kullanici_ID = $("li:contains(" + ikinci_kullaniciadi + ")").attr('id');
                    }

                    

                    data = {
                        from: localStorage.getItem("username"),
                        mesaj: mesaj,
                        tarih: moment().format("DD/MM/YYYY HH:mm"),
                        ikinci_kullanici_ID: ikinci_kullanici_ID,
                        ikinci_kullaniciadi: ikinci_kullaniciadi
                    };
                    
                    socket.emit('ikinci_kullanıcıyı_dahil_etme', data);
                }


                socket.emit('input', {
                    username: localStorage.getItem("username"),
                    mesaj: mesaj,
                    tarih: moment().format("DD/MM/YYYY HH:mm"),
                    ekranID: ekranID,
                    publicChat: publicChat  
                });
                $("#chatText").val("");
                e.preventDefault();
            } else {
                alert('Bir mesaj girmelisin!');
            }
        }

    });

 

    socket.on('output', function (data) {

        let ekranID;

        if (!$("div#chatEkrani div#" + data.ekranID).length) {
            let userArray = data.ekranID.split("-");
            ekranID = userArray[1] + "-" + userArray[0];
        } else {
            ekranID = data.ekranID;
        }

        if (data.publicChat && !$("div#genelchatOdasi").hasClass('active')) {
            $("div#genelchatOdasi").addClass('yeni');
        } else {
            if (!$("div#" + ekranID).hasClass('active')) {
                $("div#chatOdalari div#" + data.username).addClass('yeni'); 
            }
        }



        $("div#chatEkrani div#" + ekranID).append("<p>[" + data.tarih + "] <b>" + data.username + "</b>: " + data.mesaj + "</p>");

        $('div.chatroom.active').animate({ scrollTop: $('div.chatroom.active').prop('scrollHeight') }, 1000);


    })

   
    socket.on('messages', function (data) {
        data.forEach(element => {
            $("div#genelChatEkrani").append("<p>[" + element.tarih + "] <b>" + element.username + "</b>: " + element.mesaj + "</p>");

        });
    });

    

    $(document).on("dblclick", "div#kullanicilar li", function () {


        let socketID = $(this).attr('id');
        let gonderenin_kullanici_adi = localStorage.getItem("username");
        let alicinin_kullanici_adi = $(this).text();

        $("#chatText").focus();

        if ($("div#chatOdalari > div#" + alicinin_kullanici_adi).length) {  
            $("div#chatOdalari > div#" + alicinin_kullanici_adi).click();
            return;
        }

        $("div#chatOdalari > div").removeClass('active');
        $("div#chatEkrani > div").removeClass('active');    

        $("div#chatOdalari").append("<div id=" + alicinin_kullanici_adi + " class='active'>" + "<span>x</span>" + alicinin_kullanici_adi + "</div>");
        $("div#chatEkrani").append("<div id=" + gonderenin_kullanici_adi + "-" + alicinin_kullanici_adi + " class='chatroom active'</div>");

    });

    
    socket.on('ikinci_kullanıcı_chat_ekranı', function (data) {
        if ($("div#" + data.from).length) return;

        var r = confirm(data.from + " sizle mesajlaşmak istiyor. Kabul ediyor musunuz ?");
        if (r == true) {
            $("div#chatOdalari > div").removeClass('active');
            $("div#chatEkrani > div").removeClass('active');

            $("div#chatOdalari").append("<div id=" + data.from + " class='active'>" + "<span>x</span>" + data.from + "</div>");
            $("div#chatEkrani").append("<div id=" + data.from + "-" + data.ikinci_kullaniciadi + " class='chatroom active'</div>");
        } else {
            
            socket.emit('onaylanmadi',localStorage.username);
            return;
        }


    });

    

    $("div#chatOdalari").on("click", "div", function () {

        $("div#chatOdalari > div").removeClass('active');
        $("div#chatEkrani > div").removeClass('active');

        $(this).addClass('active');
        $(this).removeClass('yeni');

        if ($("div#genelchatOdasi").hasClass('active')) {
            $("#genelChatEkrani").addClass('active');
        } else {

            let firstusername = localStorage.getItem("username");
            let secondusername = $(this).attr('id'); 

            $("div#chatEkrani div#" + firstusername + "-" + secondusername).addClass('active');
            $("div#chatEkrani div#" + secondusername + "-" + firstusername).addClass('active');

        }
    });

   

    $("div#chatOdalari").on('click', 'span', function (e) {
        e.stopPropagation();

        let firstusername = localStorage.getItem("username");
        let secondusername = $(this).parent().attr('id');

        $("div#chatEkrani div#" + firstusername + "-" + secondusername).remove();
        $("div#chatEkrani div#" + secondusername + "-" + firstusername).remove();

        $(this).parent().remove();

        if ($("div#chatOdalari > div").length == 1) {
            $("div#genelchatOdasi").addClass('active');
            $("div#genelChatEkrani").addClass('active');


        }
    });
    




});