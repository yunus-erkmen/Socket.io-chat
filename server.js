const MongoClient = require('mongodb').MongoClient;
const io = require('socket.io').listen(4000);
let url = 'mongodb://127.0.0.1/socketchat';



MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log('MongoDB ye bahlanildi.');

    
    const socketchat = db.db('socketchat');
    const users = socketchat.collection('users');
    const messages = socketchat.collection('messages');


    

    io.on('connection', function (socket) {
        console.log('Socket.io ya bağlanıldı. Id:' + socket.id); 


        socket.on('username', function (username) {
            console.log(username);


            users.find().toArray(function (err, res) {
                if (err) throw err;
                socket.emit('users', res);
            });

            messages.find().toArray(function (err, res) {
                if (err) throw err;
                socket.emit('messages', res);

            })

            users.insertOne({ socketID: socket.id, username: username }); 
            socket.broadcast.emit('logon', {
                socketID: socket.id,
                username: username
            });
        });

       



        socket.on('disconnect', function () {
            

            users.deleteOne({ socketID: socket.id }, function () {
                socket.broadcast.emit('logoff', socket.id);     
            });
        });

       

        socket.on('input', function (data) {

            

            if (data.publicChat) {
                messages.insertOne({ username: data.username, mesaj: data.mesaj, tarih: data.tarih });

            }


            io.emit('output', data);  
        });

       

        socket.on('ikinci_kullanıcıyı_dahil_etme', function (data) {
            
            socket.to(data.ikinci_kullanici_ID).emit('ikinci_kullanıcı_chat_ekranı', data);
        });

        socket.on('onaylanmadi', function (data) {
            return;
        })







    });

});