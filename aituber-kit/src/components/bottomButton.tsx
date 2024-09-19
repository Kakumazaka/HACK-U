import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { IconButton } from './iconButton'
import { Form } from './form';
import { handleSendChatFn2 } from '@/features/chat/handlers';
import { handleSendChatFn } from '@/features/chat/handlers';
import MemoManager from './buttonComponents/memo';
import QuaggaScanner from './buttonComponents/quagga';

export const BottomButton = () => {
    const [showForm, setShowForm] = useState(false);
    const { t } = useTranslation()
    const handleSendChat = handleSendChatFn({
        NotConnectedToExternalAssistant: t('NotConnectedToExternalAssistant'),
        APIKeyNotEntered: t('APIKeyNotEntered'),
    })
    const [error, setError] = useState(null);
    const [view, setView] = useState<'form' | 'memo' | 'quagga'>('form'); // 'form' | 'memo' | 'quagga' で表示を管理


    // APIのエンドポイント
    const apiUrl = "http://localhost:5000/check-future-date"
    const getMemo = async (): Promise<string> => {
        let message = '以下に買い物メモに書いてあるアイテムを示します。可愛くお願いしてください。'; // message を初期化
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.matchingNames.length > 0) {
                // アイテムが存在する場合の処理
                const itemsList = data.matchingNames.map((item: string) => {
                    return `${item}`;
                }).join('\n');
                message += `アイテム一覧:\n${itemsList}\nこれらのアイテムを買ってきてほしいとすべて読み上げたうえでお願いしてください。`;
            } else {
                // アイテムが存在しない場合の処理
                message += 'アイテムがありません。今は買ってほしいものがないと伝えてください。';
            }
            return message; // message を戻り値として返す
        } catch (error) {
            //setError(error.message); // エラーを状態に保存
            return ''; // エラー発生時には空文字を返す
        }
    };

    //memoの表示と読み上げ
    const showMemo = useCallback(async() => {
        if (!showForm) {
            const memoText = await getMemo();
            console.log('memo')
            //ここに初期メッセージ
            handleSendChat(memoText);
        }
        setShowForm(true);
    }, [showForm, handleSendChat])
    //memo編集画面への遷移
    const editMemo = () => setView('memo');
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
                                onClick={editMemo}
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
            {view === 'memo' && <MemoManager memos={[]} addMemo={function (newMemo: string): void {
                throw new Error('Function not implemented.');
            } } editMemo={function (id: number, updatedContent: string): void {
                throw new Error('Function not implemented.');
            } } deleteMemo={function (id: number): void {
                throw new Error('Function not implemented.');
            } } clearMemos={function (): void {
                throw new Error('Function not implemented.');
            } } />} 
            {view === 'quagga' && <QuaggaScanner onDetected={function (barcode: string): void {
                throw new Error('Function not implemented.');
            } } />} 
        </>
    );
};
