import React, { useState, useEffect } from 'react';
import { IconButton } from '../iconButton';
import styles from './custom.module.css';

// メモの型定義
interface Memo {
    id: number;
    content: string;
}

// メモ管理コンポーネントのプロパティ型
interface MemoManagerProps {
    memos: Memo[];
    addMemo: (newMemo: string) => void;
    editMemo: (id: number, updatedContent: string) => void;
    deleteMemo: (id: number) => void;
    clearMemos: () => void;
    updateView: (view: 'form' | 'memo' | 'quagga') => void;
}

const MemoManager: React.FC<MemoManagerProps> = ({ memos, addMemo, editMemo, deleteMemo, clearMemos, updateView }) => {
    const [newMemo, setNewMemo] = useState('');
    const [opened, setOpened] = useState(true)

    return (
        <div>
            {opened && (<div className="absolute z-40 w-full h-full px-24 py-40 bg-black/30 font-M_PLUS_2">
                <div className="relative mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
                    <IconButton
                        iconName="24/Close"
                        isProcessing={false}
                        onClick={() => {
                            setOpened(false)
                            updateView('form')
                        }}
                        className="absolute top-8 right-8 bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white"
                    ></IconButton>
                    <h1>メモ管理</h1>
                    <input
                        type="text"
                        value={newMemo}
                        onChange={(e) => setNewMemo(e.target.value)}
                        placeholder="メモを入力してください"
                    />
                    <button id={styles.my_button} onClick={() => { addMemo(newMemo); setNewMemo(''); }}>メモを追加</button>

                    <ul>
                        {memos.map((memo) => (
                            <li key={memo.id}>
                                <input
                                    type="text"
                                    value={memo.content}
                                    onChange={(e) => editMemo(memo.id, e.target.value)}
                                />
                                <button id={styles.my_button} onClick={() => deleteMemo(memo.id)}>削除</button>
                            </li>
                        ))}
                    </ul>
                    <button id={styles.my_button} onClick={clearMemos}>全てクリア</button>
                </div>
            </div>)}
        </div>
    );
};

export default MemoManager;
