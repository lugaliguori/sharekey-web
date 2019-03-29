function success(message){
    alert(message)
  }
  
  
  function error(message){
    alert(message)
  }
  
function encryptKeys(key,seed){
  console.log(seed)
  var ciphertext = CryptoJS.AES.encrypt(key,seed);
  return ciphertext
}

  angular.module('sharekey.keys', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.keys', {
      url: '/keys',
      templateUrl: '../dashboard/profile/keys/keys.html',
      controller: 'keysController',
      css: 'keys.css'
    })
  }])
  
  .controller('keysController', function($scope,$http,$localStorage,$state,$window){
    var uid = $localStorage.uid;
    $scope.key = $localStorage[uid + '-pubkey'];
    $scope.keyname = $localStorage[uid + '-keyname'];

    $scope.generarPalabras = function (){
      console.log('fetching')
      $http({
        url: 'https://sharekey.herokuapp.com/mnemonic',
        method: 'GET',
      }).then(function (response){
        if (response.data.status == 200){
            $localStorage[$localStorage.uid + '-words'] = response.data.message;
            $scope.words = response.data.message
        }else{
          error(response.data.message);
        }  
      })
          
    }

    storekeys = function (public,private,pass){
        
        var storeRequest = $.param({
          pubkey: public,
          privkey: private,
          pass: pass
        })
          
        $http({
          url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid + '/storeKeys',
          method: 'POST',
          data: storeRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).then(function (response){
            if (response.data.status == 200){
                console.log('keys stored succesfully')
                $window.location.reload();
            }else{
              error(response.data.message);
            }
        })
    }
    $scope.generateKeys =  function (){
            var uid = $localStorage.uid;
            var options = {
                userIds: [{ name: $scope.name, email: $scope.email}],
                numBits: 4096,
                passphrase: $scope.passphrase,
            }
            console.log("Generating Keys")
            console.log($scope.words);
            $localStorage[uid + '-keyname'] = $scope.keyname
            openpgp.generateKey(options).then(function(key){
                var privkey = key.privateKeyArmored;
                var pubkey = key.publicKeyArmored;
                console.log('keys created')
                var privateKey = encryptKeys(privkey,$localStorage[uid + '-words'])
                var pass = encryptKeys($scope.passphrase,$localStorage[uid + '-words'])
                privateKey = privateKey.toString()
                pass = pass.toString();
                $localStorage[uid + '-pubkey'] = pubkey;
                $localStorage[uid + '-privateKey'] = privateKey;
                $localStorage[uid + '-pass'] = pass;
                console.log('keys encrypted');
                storekeys(pubkey,privateKey,pass)
              }).catch(function (error){
                console.log(error.code + '\n' + error.message);
              })
        }
    
        
    $scope.deleteKeys  =  function (){
      delete $localStorage[uid + '-pubkey'];
      delete $localStorage[uid + '-privateKey'];
      delete $localStorage[uid + '-pass'];
      delete $localStorage[uid + '-keyname'];
      $window.location.reload();
    }

    $scope.decrypt = function (){
      var pass = $localStorage[uid + '-pass'];
      console.log($scope.words)
      word = $localStorage[uid + '-words'];
      //$scope.words = $localStorage[uid + '-words'];
      var bytes  = CryptoJS.AES.decrypt(pass,word);
      var plaintext = bytes.toString(CryptoJS.enc.Utf8);
      console.log(plaintext)


    }
        
  })            