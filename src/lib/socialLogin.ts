import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {
  LoginManager,
  GraphRequest,
  GraphRequestManager,
  AccessToken,
  Profile,
} from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';
// import {Platform} from 'react-native';
import jwtDecode from 'jwt-decode';
import {
  KakaoOAuthToken,
  KakaoProfile,
  login,
  logout,
  unlink,
  getProfile,
} from '@react-native-seoul/kakao-login';

export default (method: string) =>
  new Promise((resolve, reject) => {
    const google = async () => {
      try {
        // if (Platform.OS === 'ios') {
        await GoogleSignin.configure({
          webClientId:
            '1083781663033-ulsjg1qm4p3c48bbi6bem9vre4ke9ipj.apps.googleusercontent.com',
        });
        const {idToken} = await GoogleSignin.signIn();
        // console.log(`22`, idToken);
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        const loginResult = await auth().signInWithCredential(googleCredential);
        if (loginResult) {
          // @ts-ignore
          const {email, given_name: name} =
            // @ts-ignore
            loginResult.additionalUserInfo.profile;
          const {uid: identifier} = loginResult.user;
          const payload = {
            loginData: {email, name, identifier},
            loginType: 'GO',
          };
          return payload;
        }
      } catch (e) {
        console.log(`[Goggle Error]`, e.message);
        //   ToastAndroid.show(msg, ToastAndroid.LONG);
      }
    };
    const apple = async () => {
      const appleResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      // console.log(`@@@@@RES ios @@@@@@`, appleResponse);

      // @ts-ignore
      const token: any = jwtDecode(appleResponse.identityToken);
      console.log(`@@@token: `, appleResponse);
      const payload = {
        loginData: {
          identifier: appleResponse.user,
          name: '',
          email: token.email,
        },
        loginType: 'AP',
      };
      console.log(`@@@payload: `, payload);
      return payload;
    };
    const fb = () =>
      new Promise((res2, rej2) => {
        LoginManager.logOut();
        try {
          LoginManager.logInWithPermissions(['public_profile', 'email'])
            .then(
              async result => {
                console.log(`##2`);
                if (result.isCancelled) {
                  console.log('#0 Login cancelled (FB)');
                  return null;
                }

                const data = await AccessToken.getCurrentAccessToken();
                if (!data) {
                  throw 'Something went wrong obtaining access token';
                }
                console.log(`token::: `, data.accessToken);
                const facebookCredential = auth.FacebookAuthProvider.credential(
                  data.accessToken,
                );
                const user = await auth().signInWithCredential(
                  facebookCredential,
                );

                const {
                  // @ts-ignore
                  email,
                  // @ts-ignore
                  id: identifier,
                  // @ts-ignore
                  name,
                } = user.additionalUserInfo?.profile;
                if (!email) rej2('email undefined');
                console.log('@@@@@user data', email, identifier, name);

                const payload = {
                  loginData: {
                    identifier,
                    name,
                    email,
                  },
                  loginType: 'FA',
                };

                res2(payload);
              },
              error => {
                console.log('#2 FB Login Err: ', error);
                return null;
              },
            )
            .catch(e => {
              console.log(`e:::: `, e);
            });
        } catch (e) {
          console.log(`Error FB:: `, e.message);
        }
      });

    const kakao = async () => {
      try {
        await login();
        const profile: KakaoProfile = await getProfile();
        if (profile) {
          const payload = {
            loginData: {
              identifier: profile.id,
              name: '',
              email: profile.email,
            },
            loginType: 'KA',
          };

          await logout();
          resolve(payload);
        }

        return null;
      } catch (e) {
        console.log(`Kakao Error :: `);
        await logout();
        return null;
      }
    };

    const returnLoginInfo = (info: any) => {
      if (info) resolve(info);
      else reject(null);
    };
    switch (method) {
      case 'GOOGLE':
        google().then(returnLoginInfo);
        break;
      case 'APPLE':
        apple().then(returnLoginInfo);
        break;
      case 'FACEBOOK':
        fb().then(returnLoginInfo);
        break;
      case 'KAKAOTALK':
        kakao().then(returnLoginInfo);
    }
  });
