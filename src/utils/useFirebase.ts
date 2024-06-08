import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore"
import { generateRandomString } from "@/utils/useRandom.js"

initializeApp({
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
})

const db = getFirestore()

const errorMessage = {
  "permission-denied": "權限不足",
  "no-such-document": "查無資料",
}

/**
 * 返回整個collection下的document組成的陣列，有完整的查詢功能
 */
// 所有資料中都有state欄位，刪除時不會真刪除，而是設為delete做假刪除
export async function getCollection(col: string): Promise<any> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, col), where("state", "==", "enable"))
    )
    const array: object[] = []
    querySnapshot.forEach((doc) => {
      if (doc.data()) {
        array.push(doc.data())
      } else {
        throw "no-such-document"
      }
    })

    return array
  } catch (error: any) {
    console.log("error:", error)
    return []
  }
}
/**
 * 返回該collection下的該document資料
 */
export async function getDocument(col: string, document: string): Promise<any> {
  try {
    const docSnap = await getDoc(doc(db, col, document))

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      throw "no-such-document"
    }
  } catch (error: any) {
    console.log("error:", error)
    return undefined
  }
}
/**
 * 在該doc建立新資料，相同doc內的同id會被取代
 */
export async function setDocument(
  col: string,
  document: string,
  params: object
): Promise<any> {
  try {
    const logID = generateRandomString(10)
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(doc(db, col, document))
      if (sfDoc.exists()) {
        throw "Document exist"
      }

      transaction.set(doc(db, col, document), params)
    })

    return `${col}/${document} Set`
  } catch (error: any) {
    const errorCode = error.code
    console.log(errorCode)

    if (error === "Document exist") {
      throw "檔案已存在"
    }
    throw errorMessage[`${errorCode}`] + `(${col}/${document})`
  }
}
/**
 * 在該doc建立資料，取名為亂數
 * 帶入一個空id，會自動替換成隨機id
 */
export async function addDocument(col: string, params: object): Promise<any> {
  try {
    const randomId = generateRandomString(6)
    await runTransaction(db, async (transaction) => {
      transaction.set(doc(db, col, randomId), { ...params, id: randomId })
    })

    return `${col}/${randomId} Add`
  } catch (error: any) {
    const errorCode = error.code
    console.log(errorCode)

    throw errorMessage[`${errorCode}`] + `(${col})`
  }
}
/**
 * 更新該doc資料
 */
export async function updateDocument(
  col: string,
  document: string,
  params: object
): Promise<any> {
  try {
    await runTransaction(db, async (transaction) => {
      transaction.update(doc(db, col, document), {
        ...params,
        timestamp: serverTimestamp(),
      })
    })

    return `${col}/${document} Update`
  } catch (error: any) {
    const errorCode = error.code
    console.log(errorCode)

    throw errorMessage[`${errorCode}`] + `(${col}/${document})`
  }
}
/**
 * 刪除doc
 */
export async function deleteDocument(
  col: string,
  document: string
): Promise<any> {
  try {
    const memberlogID = generateRandomString(10)
    await runTransaction(db, async (transaction) => {
      transaction.delete(doc(db, col, document))
    })

    return `${col}/${document} Delete`
  } catch (error: any) {
    const errorCode = error.code
    console.log(errorCode)

    throw errorMessage[`${errorCode}`] + `(${col}/${document})`
  }
}
