import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { IconButton } from './iconButton'
import { Form } from './form';
import { handleSendChatFn2 } from '@/features/chat/handlers';
import { handleSendChatFn } from '@/features/chat/handlers';
import MemoManager from './buttonComponents/memo';
import QuaggaScanner from './buttonComponents/quagga';

// メモの型定義
interface Memo {
    id: number;
    content: string;
}

export const BottomButton = () => {
    const [showForm, setShowForm] = useState(false);
    const { t } = useTranslation()
    const handleSendChat = handleSendChatFn({
        NotConnectedToExternalAssistant: t('NotConnectedToExternalAssistant'),
        APIKeyNotEntered: t('APIKeyNotEntered'),
    })
    const [error, setError] = useState(null);
    const [view, setView] = useState<'form' | 'memo' | 'quagga'>('form'); // 'form' | 'memo' | 'quagga' で表示を管理
    const [memos, setMemos] = useState<Memo[]>([]);
    const updateMemos = (newMemos: Memo[]) => {
        setMemos(newMemos);
      };

    useEffect(() => {
        // Webアプリ起動時にサーバーから消費期間経過したカテゴリ名を取得し、メモに追加する
        const addProductToMemoOnStartup = () => {
            fetch('http://localhost:5000/api/add-memo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        return response.json(); // カテゴリ情報をJSON形式で取得
                    } else {
                        throw new Error('カテゴリの取得に失敗しました');
                    }
                })
                .then((data) => {
                    const categoryNames = data.categories; // サーバーからのカテゴリ名リストを取得
                    if (categoryNames && categoryNames.length > 0) {
                        // 各カテゴリ名をメモに追加
                        const newMemos = [...memos];
                        categoryNames.forEach((categoryName: any) => {
                            newMemos.push({ id: count, content: categoryName });
                            setCount(count + 1);
                        });
                        setMemos(newMemos); // メモに保存
                    }
                })
                .catch((error) => {
                    console.error('Error fetching categories on startup:', error);
                });
        };

        addProductToMemoOnStartup();

        const savedMemos = localStorage.getItem('memos');
        if (savedMemos) {
            setMemos(JSON.parse(savedMemos));
        }
    }, []);
    const [count, setCount] = useState<number>(1);

    useEffect(() => {
        localStorage.setItem('memos', JSON.stringify(memos));
    }, [memos]);

    // メモを追加する関数
    const addMemo = (newMemo: string) => {
        if (newMemo.trim() !== '') {
            const newMemos: Memo = { id: count, content: newMemo };
            setMemos(prevMemos => [...prevMemos, newMemos]);
            setCount(count + 1)
        }
    };

    // メモを編集する関数
    const editMemo = (id: number, updatedContent: string) => {
        const updatedMemos = memos.map((memo) =>
            memo.id === id ? { ...memo, content: updatedContent } : memo
        );
        setMemos(updatedMemos);
    };

    // メモを削除する関数
    const deleteMemo = (id: number) => {
        const filteredMemos = memos.filter((memo) => memo.id !== id);
        setMemos(filteredMemos);
    };

    // 全てのメモをクリアする関数
    const clearMemos = () => {
        localStorage.removeItem('memos');
        setMemos([]);
    };

    const handleBarcodeDetected = (barcode: string) => {
        console.log('検出されたバーコード:', barcode);
        // 検出されたバーコードに基づいて何かしらの処理を行う（例: サーバーからデータを取得してメモに追加）
        addMemo(`検出されたバーコード: ${barcode}`);
    };

    // APIのエンドポイント
    //const apiUrl = "http://localhost:5000/api/add-memo"
    const getMemo = async (): Promise<string> => {
        let message = '以下に買い物メモに書いてあるアイテムを示します。可愛くお願いしてください。'; // message を初期化
        if (memos.length > 0) {
            message += `アイテム一覧:\n`;
            message += memos.map(memo => memo.content).join(', ');
            message += `アイテム一覧:\n\nこれらのアイテムを買ってきてほしいとすべて読み上げたうえでお願いしてください。`;
        } else {
            message += 'メモがありませんでした。今買ってきてほしいものはないことを伝えてください。'
        }
        console.log('message');
        return message;
        // try {
        //     const response = await fetch(apiUrl);
        //     if (!response.ok) {
        //         throw new Error(`HTTP error! status: ${response.status}`);
        //     }
        //     const data = await response.json();
        //     if (data.matchingNames.length > 0) {
        //         // アイテムが存在する場合の処理
        //         const itemsList = data.matchingNames.map((item: string) => {
        //             return `${item}`;
        //         }).join('\n');
        //         message += `アイテム一覧:\n${itemsList}\nこれらのアイテムを買ってきてほしいとすべて読み上げたうえでお願いしてください。`;
        //     } else {
        //         // アイテムが存在しない場合の処理
        //         message += 'アイテムがありません。今は買ってほしいものがないと伝えてください。';
        //     }
        //     return message; // message を戻り値として返す
        // } catch (error) {
        //     //setError(error.message); // エラーを状態に保存
        //     return ''; // エラー発生時には空文字を返す
        // }
    };

    //memoの表示と読み上げ
    const showMemo = useCallback(async () => {
        if (!showForm) {
            const memoText = await getMemo();
            console.log('memo')
            //ここに初期メッセージ
            handleSendChat(memoText);
        }
        setShowForm(true);
    }, [showForm, handleSendChat])
    //memo編集画面への遷移
    const goEditMemo = () => setView('memo');
    //バーコードの読み取り
    const readBarCode = () => setView('quagga');
    const back = () => {
        setShowForm(false);
    }
    return (
        <>
            {showForm ? (
                <><Form />
                    <div className="absolute bottom-0 z-20 m-24" style={{
                        right: '0px',
                        bottom: '12px',
                        transform: 'translate(0%, 0%)',
                    }}>
                        <div
                            className="grid grid-flow-col gap-[8px] mb-40"
                            style={{ width: 'max-content' }}
                        >
                            <div className="order-3">
                                <IconButton
                                    iconName="24/Prev"
                                    isProcessing={false}
                                    onClick={back}
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="absolute bottom-0 z-20 m-24" style={{
                    left: '50%',
                    transform: 'translate(-50%, 0%)',
                }}>
                    <div
                        className="grid grid-flow-col gap-[8px] mb-40"
                        style={{ width: 'max-content' }}
                    >
                        <div className="order-3">
                            <IconButton
                                iconName="32/CommentOn"
                                isProcessing={false}
                                onClick={showMemo}
                            />
                        </div>
                        <div className="order-4">
                            <IconButton
                                iconName="32/Edit"
                                isProcessing={false}
                                onClick={goEditMemo}
                            />
                        </div>
                        <div className="order-5">
                            <IconButton
                                iconName="32/Camera"
                                isProcessing={false}
                                onClick={readBarCode}
                            />
                        </div>
                    </div>
                </div>
            )}
            {view === 'memo' && <MemoManager
                memos={memos}
                addMemo={addMemo}
                editMemo={editMemo}
                deleteMemo={deleteMemo}
                clearMemos={clearMemos}
            />}
            {view === 'quagga' && <QuaggaScanner prevMemo={memos} updateMemos = {updateMemos} />}
        </>
    );
};
