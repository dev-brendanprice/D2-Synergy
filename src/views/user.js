// var log = console.log.bind(console);
// var localStorage = window.localStorage;

// const AuthorizeBungie = async () => {
//     var AuthorizationCode = window.location.search.replace('?code=','');
//     var components = {};
//     var AxiosConfig = {
//         headers: {
//             "Authorization": `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//         }
//     };

//     try {
//         await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${AuthorizationCode}`, AxiosConfig)
//         .then(res => {
//             components = res.data;
//             components['authorization_code'] = AuthorizationCode;
//             localStorage.setItem('components', JSON.stringify(components));
//         });
//     } 
//     catch (error) {
//         log('InvalidParams: @{Resetting Params}');
//         window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
//     };
// };

// const FetchBungieUserDetails = async () => {
//     var components = JSON.parse(localStorage.getItem('components'));
//     var bungieNetUser = {};
//     var AxiosConfig = {
//         headers: {
//             "X-API-Key": 'e62a8257ba2747d4b8450e7ad469785d',
//             Authorization: `Bearer ${components['access_token']}`
//         }
//     };

//     try {
//         const GetBungieNetUserById = await axios.get(`https://www.bungie.net/Platform/User/GetBungieNetUserById/${components['membership_id']}/`, AxiosConfig);
//         bungieNetUser = GetBungieNetUserById.data['Response'];

//         const GetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/0/`, AxiosConfig);
//         bungieNetUser = GetMembershipsById.data['Response'];
//         localStorage.setItem('bungieNetUser', JSON.stringify(bungieNetUser))

//         // var MembershipType;
//         // for (item of bungieNetUser['destinyMemberships']) {
//         //     if (item['membershipId'] == bungieNetUser['primaryMembershipId']) {
//         //         MembershipType = item['membershipType'];
//         //     };
//         // };

//         // const GetProfile = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${bungieNetUser['primaryMembershipId']}/`, AxiosConfig);
//         // log(GetProfile)
//         // bungieNetUser = GetProfile.data['Response'];
//         // localStorage.setItem('bungieNetUser', JSON.stringify(bungieNetUser))

//         // currently not working check for errors
//     }
//     catch (error) {
//         // Ask to try again or authorize
//     };
// };

// AuthorizeBungie();

console.log('hi');