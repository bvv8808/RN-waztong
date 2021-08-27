import axios from 'axios';
import {TSpend} from '../types';

const url = 'http://waztong.iozenweb.co.kr/api/api.php';

export const mutAd = (token: string) =>
  new Promise(async (resolve, reject) => {
    reject('Not implementation');
    // const r = await axios.post(url, {
    //   query: `
    //         mutation {
    //             setAdWatch(session: "${token}")
    //         }
    //     `,
    // });

    // if (r.data.errors) {
    //   console.log(`@@@@@ GQL Request Fail: mutAd\n`, r.data);
    //   reject(r.data.errors[0].message);
    // } else resolve(true);
  });
export const mutSpend = (token: string, type: TSpend, idx: number) =>
  new Promise(async (resolve, reject) => {
    const query = `
    mutation {
        setBuy(session: "${token}",  idx: ${idx}, boardType: ${type[0].toUpperCase()}T)
    }
`;
    console.log(`query:mutSpend===== `, query);
    const r = await axios.post(url, {
      query,
    });

    if (r.data.errors) {
      console.log(`@@@@@ GQL Request Fail: mutSpend\n`, r.data);
      reject(r.data.errors[0].message);
    } else resolve(true);
  });

export const qMyCoin = (token: string) =>
  new Promise(async (resolve, reject) => {
    const r = await axios.post(url, {
      query: `
            query {
                getMe(session: "${token}") {
                    coin
                }
            }
        `,
    });

    if (r.data.errors) {
      console.log(`@@@@@ GQL Request Fail: qMyCoin\n`, r.data);
      reject(r.data.errors[0].message);
    } else resolve(r.data.data.getMe.coin);
  });
