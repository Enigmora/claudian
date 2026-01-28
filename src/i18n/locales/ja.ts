import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': 'Claudian - 設定',
  'settings.description': 'Enigmoraが開発したObsidian用Claude AI統合プラグイン。Claudeとチャット、ノートを処理してスマートなタグやウィキリンクの提案を取得、エージェントモードで自然言語を使ってボールトを管理。プライバシー重視：APIキーはローカルに保存されます。',
  'settings.language.name': '言語',
  'settings.language.desc': 'プラグインのインターフェース言語。「自動」はObsidianの設定から検出します。',
  'settings.language.auto': '自動（Obsidianから検出）',
  'settings.apiKey.name': 'APIキー',
  'settings.apiKey.descPart1': 'Anthropic APIキーは',
  'settings.apiKey.descPart2': 'で取得できます。ボールト内にローカル保存されます。',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': 'モデル',
  'settings.model.desc': '使用するClaudeモデルを選択してください。',
  'settings.model.sonnet4': 'Claude Sonnet 4（推奨）',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku45': 'Claude Haiku 4.5（高速）',
  // Execution Mode (Model Orchestrator)
  'settings.executionMode.name': '実行モード',
  'settings.executionMode.desc': 'タスクに対するClaudeのモデル選択方法。',
  'settings.executionMode.automatic': '自動（推奨）',
  'settings.executionMode.automaticDesc': 'スマートルーティング：シンプルなタスクはHaiku、複雑なタスクはSonnet、深い分析はOpus。',
  'settings.executionMode.economic': 'エコノミー',
  'settings.executionMode.economicDesc': 'すべてのタスクでHaikuを使用。最速かつ最も経済的。',
  'settings.executionMode.maxQuality': '最高品質',
  'settings.executionMode.maxQualityDesc': 'すべてのタスクでOpusを使用。複雑な分析と執筆に最適。',
  'settings.executionMode.currentModel': '使用中: {{model}}',
  'settings.folder.name': 'ノートフォルダ',
  'settings.folder.desc': 'チャットから生成されたノートを保存するフォルダ。',
  'settings.folder.placeholder': 'Claudian',
  'settings.maxTokens.name': '最大トークン数',
  'settings.maxTokens.desc': 'レスポンスの最大トークン数（1000-8192）。',
  'settings.customInstructions.name': 'カスタム指示',
  'settings.customInstructions.desc': 'Claudeの動作をパーソナライズするための追加指示。基本指示に追加されます（置き換えではありません）。',
  'settings.customInstructions.placeholder': '例：常にフォーマルな日本語で回答し、箇条書きを使用してください...',
  'settings.customInstructions.clear': 'クリア',
  'settings.customInstructions.cleared': 'カスタム指示をクリアしました',
  'settings.section.noteProcessing': 'ノート処理',
  'settings.maxNotesContext.name': 'コンテキスト内の最大ノート数',
  'settings.maxNotesContext.desc': '処理時に含めるノートタイトルの最大数（10-500）。',
  'settings.maxTagsContext.name': 'コンテキスト内の最大タグ数',
  'settings.maxTagsContext.desc': '処理時に含める既存タグの最大数（10-200）。',
  'settings.section.agentMode': 'エージェントモード',
  'settings.agentEnabled.name': 'デフォルトでエージェントモードを有効化',
  'settings.agentEnabled.desc': 'エージェントモードは、Claudeがボールトに対してアクションを実行できるようにします。',
  'settings.confirmDestructive.name': '破壊的アクションの確認',
  'settings.confirmDestructive.desc': 'ファイルの削除やコンテンツの置き換え前に確認を要求します。',
  'settings.protectedFolders.name': '保護フォルダ',
  'settings.protectedFolders.desc': 'エージェントが変更できないフォルダ（カンマ区切り）。',
  'settings.protectedFolders.placeholder': 'templates, private',
  'settings.maxActions.name': 'メッセージあたりの最大アクション数',
  'settings.maxActions.desc': '1つのメッセージでClaudeが実行できるアクションの制限（1-20）。',
  'settings.footer.license': 'MITライセンスの下でライセンスされています',
  'settings.footer.developedBy': '開発',
  'settings.footer.sourceCode': 'ソースコード',

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  'chat.placeholder': 'メッセージを入力...',
  'chat.send': '送信',
  'chat.clearLabel': 'チャットをクリア',
  'chat.cleared': 'チャットをクリアしました',
  'chat.agentLabel': 'エージェント',
  'chat.agentEnabled': 'エージェントモードが有効です',
  'chat.agentDisabled': 'エージェントモードが無効です',
  'chat.copyLabel': 'コピー',
  'chat.copied': 'クリップボードにコピーしました',
  'chat.createNoteLabel': 'ノートを作成',
  'chat.actionsExecuted': '{{count}}件のアクションを実行しました',
  'chat.actionsPartial': '{{success}}件成功、{{failed}}件失敗',
  'chat.actionsCancelled': 'ユーザーによりアクションがキャンセルされました。',
  'chat.error': 'エラー: {{message}}',
  'chat.errorUnknown': '不明なエラー',
  'chat.stop': '停止',
  'chat.streamStopped': 'ユーザーによりレスポンスが停止されました',

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': 'APIキーが設定されていません。設定 > Claudianで設定してください。',
  'error.apiKeyInvalid': '無効なAPIキーです。設定でキーを確認してください。',
  'error.rateLimit': 'レート制限を超えました。数秒後に再試行してください。',
  'error.connection': '接続エラー。インターネット接続を確認してください。',
  'error.unknown': 'Claudeとの通信で不明なエラーが発生しました。',
  'error.noActiveNote': 'アクティブなMarkdownノートがありません。',
  'error.parseJson': 'レスポンスに有効なJSONが見つかりません。',
  'error.parseResponse': '提案JSONの解析エラー。',
  'error.tooManyActions': 'アクションが多すぎます（{{count}}件）。最大許容数: {{max}}',
  // Vault action errors
  'error.protectedPath': '保護されたパス: {{path}}',
  'error.folderNotFound': 'フォルダが見つかりません: {{path}}',
  'error.folderNotEmpty': 'フォルダが空ではありません: {{path}}',
  'error.fileAlreadyExists': 'ファイルは既に存在します: {{path}}。上書きするにはoverwrite: trueを使用してください。',
  'error.noteNotFound': 'ノートが見つかりません: {{path}}',
  'error.sourceNoteNotFound': 'ソースノートが見つかりません: {{path}}',
  'error.fileNotFound': 'ファイルが見つかりません: {{path}}',
  'error.momentNotAvailable': 'Moment.jsが利用できません',
  'error.noActiveLeafToSplit': '分割するアクティブなリーフがありません',
  'error.unknownError': '不明なエラー',
  // Concept map errors
  'error.conceptMapParse': 'コンセプトマップの解析エラー',
  'error.noValidJsonInResponse': 'レスポンスに有効なJSONが見つかりません',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE CREATOR MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'noteCreator.title': 'チャットからノートを作成',
  'noteCreator.preview': 'プレビュー',
  'noteCreator.titleField.name': 'タイトル',
  'noteCreator.titleField.desc': 'ファイル名（.md拡張子なし）',
  'noteCreator.tags.name': 'タグ',
  'noteCreator.tags.desc': 'カンマ区切り',
  'noteCreator.tags.placeholder': 'タグ1, タグ2, タグ3',
  'noteCreator.folder.name': 'フォルダ',
  'noteCreator.folder.desc': 'ノートの保存先フォルダ',
  'noteCreator.cancel': 'キャンセル',
  'noteCreator.create': 'ノートを作成',
  'noteCreator.titleRequired': 'タイトルは必須です',
  'noteCreator.fileExists': 'この名前のファイルは既に存在します: {{name}}',
  'noteCreator.created': 'ノートを作成しました: {{path}}',
  'noteCreator.error': 'ノート作成エラー: {{message}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'batch.titleExtraction': 'バッチ処理',
  'batch.titleConceptMap': 'コンセプトマップを生成',
  'batch.selectNotes': 'ノートを選択',
  'batch.selectFolder': 'フォルダを選択',
  'batch.selectAll': 'すべて選択',
  'batch.clear': 'クリア',
  'batch.counter': '{{count}}件のノートを選択',
  'batch.noNotes': 'ボールトにノートがありません',
  'batch.rootFolder': 'ルート',
  'batch.selectTemplate': 'テンプレートを選択',
  'batch.mapOptions': 'マップオプション',
  'batch.mapTitle': 'マップタイトル:',
  'batch.mapTitlePlaceholder': 'マイコンセプトマップ',
  'batch.cancel': 'キャンセル',
  'batch.processNotes': 'ノートを処理',
  'batch.generateMap': 'マップを生成',
  'batch.selectAtLeastOne': '少なくとも1つのノートを選択してください',
  'batch.selectTemplateRequired': 'テンプレートを選択してください',
  'batch.starting': '処理を開始しています...',
  'batch.processing': '処理中 {{current}}/{{total}}: {{note}}',
  'batch.completed': '完了: {{success}}件成功、{{errors}}件エラー',
  'batch.savedTo': '結果を保存しました: {{path}}',
  'batch.analyzing': 'ノートを分析中...',
  'batch.saving': 'マップを保存中...',
  'batch.mapGenerated': 'マップが正常に生成されました',
  'batch.errorProcessing': '処理中にエラーが発生しました',
  'batch.errorGenerating': 'マップ生成中にエラーが発生しました',
  'batch.folderPrompt': 'フォルダ名を入力:',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'confirmation.title': 'アクションを確認',
  'confirmation.description': '以下のアクションは確認が必要です:',
  'confirmation.warning': 'このアクションは元に戻せません。',
  'confirmation.cancel': 'キャンセル',
  'confirmation.confirm': '確認',
  'confirmation.deleteNote': 'ノートを削除: {{path}}',
  'confirmation.deleteFolder': 'フォルダを削除: {{path}}',
  'confirmation.replaceContent': 'コンテンツを置き換え: {{path}}',
  'confirmation.overwriteNote': '既存ファイルを上書き: {{path}}',
  'confirmation.moveNote': '移動: {{from}} → {{to}}',
  'confirmation.renameNote': '名前変更: {{from}} → {{to}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'suggestions.title': 'ノートへの提案',
  'suggestions.tags': '提案タグ',
  'suggestions.tagsEmpty': 'タグの提案はありません。',
  'suggestions.selectAll': 'すべて選択',
  'suggestions.applySelected': '選択を適用',
  'suggestions.wikilinks': '提案ウィキリンク',
  'suggestions.wikilinksEmpty': 'ウィキリンクの提案はありません。',
  'suggestions.badgeExists': '既存',
  'suggestions.badgeNew': '新規',
  'suggestions.selectExisting': '既存を選択',
  'suggestions.insertSelected': '選択を挿入',
  'suggestions.atomicConcepts': 'アトミックコンセプト',
  'suggestions.atomicConceptsEmpty': 'アトミックコンセプトの提案はありません。',
  'suggestions.viewContent': 'コンテンツを表示',
  'suggestions.createNote': 'ノートを作成',
  'suggestions.noteCreated': '作成済み',
  'suggestions.tagsApplied': '{{count}}件のタグを適用しました。',
  'suggestions.wikilinksInserted': '{{count}}件のウィキリンクを挿入しました。',

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  'command.openChat': 'Claudeとチャットを開く',
  'command.processNote': 'アクティブなノートをClaudeで処理',
  'command.batchProcess': 'ノートをバッチ処理',
  'command.generateMap': 'コンセプトマップを生成',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE PROCESSOR
  // ═══════════════════════════════════════════════════════════════════════════
  'processor.reading': 'ノートの内容を読み込み中...',
  'processor.analyzing': 'Claudeで分析中...',
  'processor.processing': 'Claudeでノートを処理中...',
  'processor.relatedLinks': '関連リンク',

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  'agent.actionsExecuted': 'アクションを実行しました',
  'agent.noActions': 'アクションを実行できませんでした:',
  'agent.actionsFailed': '{{count}}件のアクションが失敗しました。',
  'agent.partialSuccess': '結果:',
  'agent.loopLimitReached': 'ループ制限に達しました。手動で続行してください。',
  'agent.processingResults': '結果を処理中（ステップ{{step}}）...',
  'agent.createFolder': 'フォルダを作成: {{path}}',
  'agent.deleteFolder': 'フォルダを削除: {{path}}',
  'agent.listFolder': 'フォルダを一覧表示: {{path}}',
  'agent.createNote': 'ノートを作成: {{path}}',
  'agent.readNote': 'ノートを読み込み: {{path}}',
  'agent.deleteNote': 'ノートを削除: {{path}}',
  'agent.renameNote': '名前変更: {{from}} → {{to}}',
  'agent.moveNote': '移動: {{from}} → {{to}}',
  'agent.copyNote': 'コピー: {{from}} → {{to}}',
  'agent.appendContent': 'コンテンツを追加: {{path}}',
  'agent.prependContent': 'コンテンツを先頭に追加: {{path}}',
  'agent.replaceContent': 'コンテンツを置き換え: {{path}}',
  'agent.updateFrontmatter': 'フロントマターを更新: {{path}}',
  'agent.searchNotes': 'ノートを検索: "{{query}}"',
  'agent.getNoteInfo': '情報を取得: {{path}}',
  'agent.findLinks': 'リンクを検索: {{target}}',
  // Editor API actions
  'agent.editorGetContent': 'エディターの内容を取得',
  'agent.editorSetContent': 'エディターの内容を設定',
  'agent.editorGetSelection': '選択テキストを取得',
  'agent.editorReplaceSelection': '選択を置き換え: {{text}}',
  'agent.editorInsertAtCursor': 'カーソル位置に挿入: {{text}}',
  'agent.editorGetLine': '{{line}}行目を取得',
  'agent.editorSetLine': '{{line}}行目を設定',
  'agent.editorGoToLine': '{{line}}行目に移動',
  'agent.editorUndo': '元に戻す',
  'agent.editorRedo': 'やり直し',
  // Commands API actions
  'agent.executeCommand': 'コマンドを実行: {{commandId}}',
  'agent.listCommands': 'コマンド一覧',
  'agent.getCommandInfo': 'コマンド情報を取得: {{commandId}}',
  // Daily Notes actions
  'agent.openDailyNote': 'デイリーノートを開く',
  'agent.createDailyNote': 'デイリーノートを作成: {{date}}',
  // Templates actions
  'agent.insertTemplate': 'テンプレートを挿入: {{templateName}}',
  'agent.listTemplates': 'テンプレート一覧',
  // Bookmarks actions
  'agent.addBookmark': 'ブックマークを追加: {{path}}',
  'agent.removeBookmark': 'ブックマークを削除: {{path}}',
  'agent.listBookmarks': 'ブックマーク一覧',
  // Canvas API actions
  'agent.canvasCreateTextNode': 'テキストノードを作成: {{text}}',
  'agent.canvasCreateFileNode': 'ファイルノードを作成: {{file}}',
  'agent.canvasCreateLinkNode': 'リンクノードを作成: {{url}}',
  'agent.canvasCreateGroup': 'グループを作成: {{label}}',
  'agent.canvasAddEdge': 'エッジを追加: {{fromNode}} → {{toNode}}',
  'agent.canvasSelectAll': 'すべてのキャンバスノードを選択',
  'agent.canvasZoomToFit': 'キャンバスをフィットにズーム',
  // Enhanced Search actions
  'agent.searchByHeading': '見出しで検索: {{heading}}',
  'agent.searchByBlock': 'ブロックIDで検索: {{blockId}}',
  'agent.getAllTags': 'すべてのタグを取得',
  'agent.openSearch': '検索を開く: {{query}}',
  // Workspace actions
  'agent.openFile': 'ファイルを開く: {{path}}',
  'agent.revealInExplorer': 'エクスプローラーで表示: {{path}}',
  'agent.getActiveFile': 'アクティブファイル情報を取得',
  'agent.closeActiveLeaf': 'アクティブタブを閉じる',
  'agent.splitLeaf': 'ビューを分割: {{direction}}',
  // Error messages for new actions
  'error.noActiveEditor': 'アクティブなエディターがありません。まずMarkdownファイルを開いてください。',
  'error.noActiveCanvas': 'アクティブなキャンバスがありません。まずキャンバスファイルを開いてください。',
  'error.pluginNotEnabled': 'プラグイン「{{plugin}}」が有効になっていません。',
  'error.commandNotFound': 'コマンドが見つかりません: {{commandId}}',
  'error.templateNotFound': 'テンプレートが見つかりません: {{templateName}}',
  'error.bookmarkNotFound': 'ブックマークが見つかりません: {{path}}',
  'error.canvasNodeNotFound': 'キャンバスノードが見つかりません: {{nodeId}}',
  'error.headingNotFound': '見出しを持つノートが見つかりません: {{heading}}',
  'error.blockNotFound': 'ブロックが見つかりません: {{blockId}}',
  'agent.genericAction': 'アクション: {{action}}',
  'agent.progressStarting': '実行を開始しています...',
  'agent.progressStatus': '実行中 {{current}}/{{total}}',
  'agent.generatingResponse': 'レスポンスを生成中...',
  'agent.streamingChars': '文字数: ',
  'agent.streamingActions': '検出されたアクション: ',
  'agent.showRawResponse': '▶ 生のレスポンスを表示',
  'agent.hideRawResponse': '▼ 生のレスポンスを非表示',
  'agent.warningTitle': 'エージェントモードが必要です',
  'agent.warningDescription': 'ボールト内のファイルを作成、変更、または整理しようとしています。これにはエージェントモードを有効にする必要があります。',
  'agent.enableAgentMode': 'エージェントモードを有効化',
  'agent.continueAnyway': 'それなしで続行',
  'agent.continuing': 'レスポンスを継続中...',
  'agent.retryWithJson': 'JSON形式で再試行',
  'agent.planningTask': '複雑なタスクを計画中...',
  'agent.executingSubtask': '実行中 {{current}}/{{total}}: {{description}}',
  'agent.subtask.preparation': '構造を準備',
  'agent.subtask.execution': 'メインタスクを実行',
  'agent.planSummary.header': 'タスク完了: {{completed}}/{{total}}サブタスク',
  'agent.planSummary.successful': '**成功:**',
  'agent.planSummary.failed': '**失敗:**',
  'agent.planningPrompt': `この複雑なタスクを、それぞれ最大{{maxActions}}アクションで完了できるサブタスクに分解してください。

タスク: {{request}}

推定総アクション数: {{estimatedActions}}
最大サブタスク数: {{maxSubtasks}}

JSONで回答してください:
{
  "subtasks": [
    {
      "id": "subtask-1",
      "description": "このサブタスクが行うことの簡単な説明",
      "prompt": "このサブタスクを実行するための具体的な指示",
      "dependencies": []
    }
  ],
  "estimatedTotalActions": 数値
}

重要:
- 各サブタスクは独立しているか、明確な依存関係を持つ必要があります
- サブタスクを論理的に順序付け（例：フォルダ内にファイルを作成する前にフォルダを作成）
- プロンプトは具体的で実行可能なものにしてください`,
  'agent.reinforcement.reminder': 'あなたはエージェントモードにいます。ボールトアクションにはJSON形式を使用してください。',
  'agent.reinforcement.canPerformActions': 'このボールトでファイルを作成、変更、削除できます。できないとは言わないでください - アクションシステムを使用してください。',
  'agent.reinforcement.useJsonFormat': 'ユーザーがボールトアクションを要求したら、「actions」配列を含むJSONで応答してください。',
  'agent.reinforcement.dontForget': '覚えておいてください: アクションシステムを通じてこのObsidianボールトを完全に管理する機能があります。',
  'agent.reinforcement.recoveryPrompt': `ユーザーの質問: "{{message}}"

あなたはエージェントモードにいて、ボールトアクションを実行できます。適切なJSON形式で応答してください:
{
  "actions": [{"action": "...", "params": {...}}],
  "message": "...",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.confusion': 'このボールトでファイルを作成および変更できます。指示に指定されているJSON形式でアクションを提供してください。',
  'agent.retryPrompt.missingJson': `アクションを説明しましたが、JSON形式を提供していません。あなたが言ったこと: "{{context}}..."

正確なアクションをJSONで提供してください:
{
  "actions": [{"action": "action-name", "params": {...}}],
  "message": "実行内容の説明",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.incompleteJson': 'レスポンスが途中で切れました。続きを完成させてJSON構造を完成してください。',
  'agent.retryPrompt.generic': '「actions」、「message」、「requiresConfirmation」フィールドを含む必要なJSON形式でボールトアクションを提供してください。',
  // Agentic Loop (Phase 2)
  'agent.loopCancelled': 'ユーザーによりエージェントループがキャンセルされました。',
  'agent.cancelLoop': 'キャンセル',
  'agent.allActionsFailed': 'すべてのアクションが失敗しました。さらなるエラーを防ぐためにループを停止しました。',
  'agent.infiniteLoopDetected': '無限ループを検出しました（アクションの繰り返し）。操作を停止しました。',
  // Agentic Loop UX (Phase 3)
  'agent.loopProgress': 'ステップ {{current}} / 最大 {{max}}',
  'agent.loopTokens': '↑{{input}} ↓{{output}}',
  'agent.loopTokenSummary': '使用トークン: ↑{{input}}入力、↓{{output}}出力',
  'agent.loopStep': 'ステップ {{step}}',
  'agent.loopStepFinal': '完了',
  'agent.loopExpandStep': 'もっと表示...',
  'agent.loopCollapseStep': '表示を減らす',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': 'モデルが能力について混乱しているようです。エージェントモードではボールトアクションを実行できます。',
  'warning.actionClaimsNoJson': 'レスポンスはアクションを実行したと主張していますが、実行可能なアクションは見つかりませんでした。',
  'warning.emptyActionsArray': 'レスポンスに空のアクション配列が含まれています。',
  'warning.incompleteJson': 'JSONレスポンスが不完全または切り捨てられているようです。',
  'warning.actionMismatch': '主張されたアクションが提供されたアクションと一致しません: {{mismatches}}',
  'suggestion.remindAgentMode': 'エージェントモードがアクティブであることをモデルに思い出させてみてください。',
  'suggestion.requestJsonFormat': '適切なJSON形式でレスポンスを要求してください。',
  'suggestion.requestContinuation': 'モデルにレスポンスを続けて完成させるよう要求してください。',
  'validation.valid': 'レスポンスの検証に成功しました。',
  'validation.validWithNotes': '軽微な注記付きでレスポンスは有効です。',

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': '高度なエージェントオプション',
  'settings.autoContinue.name': '切り捨てられたレスポンスを自動継続',
  'settings.autoContinue.desc': 'レスポンスが途中で切れたように見える場合、自動的に継続を要求します。',
  'settings.autoPlan.name': '複雑なタスクを自動計画',
  'settings.autoPlan.desc': '複雑なタスクを自動的に小さなサブタスクに分解します。',
  'settings.contextReinforce.name': 'エージェントコンテキストを強化',
  'settings.contextReinforce.desc': '長い会話でモデルがエージェントモードを忘れないようにリマインダーを追加します。',

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  'template.keyIdeas.name': '主要なアイデアを抽出',
  'template.keyIdeas.desc': 'コンテンツから主要なアイデアを識別して要約します',
  'template.summary.name': 'エグゼクティブサマリー',
  'template.summary.desc': '素早く読むための簡潔な要約を生成します',
  'template.questions.name': '未解決の質問を識別',
  'template.questions.desc': '未解決の質問や探求領域を検出します',
  'template.actions.name': 'アクションを抽出',
  'template.actions.desc': 'コンテンツで言及されているタスクとアクションを識別します',
  'template.concepts.name': 'コンセプトと定義',
  'template.concepts.desc': '重要な用語とその定義を抽出します',
  'template.connections.name': '接続と関係',
  'template.connections.desc': 'リンクを作成するためのコンセプト間の関係を識別します',

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════
  'prompt.baseIdentity': `Claudian（Enigmora製）経由でObsidianに統合されたClaude。適切な場合はMarkdownとウィキリンク（[[ノート]]）を使用してください。簡潔に。`,

  'prompt.chatMode': `重要 - エージェントモード:
ユーザーがボールトに対するアクション（ノートやフォルダの作成、移動、削除、名前変更、コンテンツの変更など）を要求し、エージェントモードが現在有効になっていない場合は、通知する必要があります:
「ボールトでアクションを実行するには、チャットヘッダーのトグルを使用して**エージェントモード**を有効にしてください。」
エージェントモードが有効になっていない状態で、ボールトアクションを説明またはシミュレートしようとしないでください。`,

  'prompt.noteProcessor': `あなたはObsidian向けのナレッジ整理に特化したアシスタントです。あなたのタスクは、ノートを分析し、ユーザーのボールトにより良く統合するための改善を提案することです。

ボールトコンテキスト:
- 総ノート数: {{noteCount}}
- 既存のノート: {{noteTitles}}
- 既存のタグ: {{allTags}}

指示:
1. 提供されたノートの内容を分析
2. 関連するタグを提案（既存のものが望ましいが、新しいものも提案可）
3. 既存のノートにリンクできるコンセプトを特定（ウィキリンク）
4. 独自のノートに値するアトミックコンセプトを検出
5. 理由を簡潔に説明

この正確な構造の有効なJSONオブジェクトのみで応答してください:
{
  "tags": ["タグ1", "タグ2"],
  "wikilinks": [
    {
      "text": "リンクに変換するテキスト",
      "target": "対象ノートのタイトル",
      "context": "リンクする理由の簡単な説明"
    }
  ],
  "atomicConcepts": [
    {
      "title": "新しいノートのタイトル",
      "summary": "1-2文の要約",
      "content": "ノートの提案コンテンツ（Markdown形式）"
    }
  ],
  "reasoning": "分析の簡単な説明"
}

重要:
- ボールトに存在するノートへのウィキリンクのみを提案
- タグには#記号を含めない
- アトミックコンセプトは独自の展開に値するアイデアである必要がある
- 提案は関連性があり有用なものに保ち、不必要なリンクで埋めない`,

  'prompt.templateProcessor': `あなたはテキストの分析と情報抽出に特化したアシスタントです。
提供された指示に従って、構造化された明確な方法で応答してください。
{{jsonInstructions}}`,

  'prompt.conceptMapGenerator': `あなたはナレッジ分析とコンセプトマップ作成に特化したアシスタントです。
あなたのタスクは、ノートセット内のコンセプト、関係、横断的なテーマを特定することです。
重要: 要求された形式に従った有効なJSONのみで応答してください。`,

  'prompt.agentMode': `Obsidianボールトアシスタント。JSONレスポンスでアクションを実行します。

⚠️ 重要: フォルダ操作では、実際のファイル名を取得するために常に最初にlist-folderを使用してください。

アクション（メッセージあたり最大{{maxActions}}):
ファイル: create-note{path,content,frontmatter?}, read-note{path}, delete-note{path}, rename-note{from,to}, move-note{from,to}, copy-note{from,to}
フォルダ: create-folder{path}, delete-folder{path}, list-folder{path,recursive?}
コンテンツ: append-content{path,content}, prepend-content{path,content}, replace-content{path,content}, update-frontmatter{path,fields}
検索: search-notes{query,field?,folder?}, get-note-info{path}, find-links{target}, search-by-heading{heading,folder?}, search-by-block{blockId}, get-all-tags{}, open-search{query}
エディター: editor-get-content{}, editor-set-content{content}, editor-get-selection{}, editor-replace-selection{text}, editor-insert-at-cursor{text}, editor-get-line{line}, editor-set-line{line,text}, editor-go-to-line{line}, editor-undo{}, editor-redo{}
コマンド: execute-command{commandId}, list-commands{filter?}, get-command-info{commandId}
デイリー/テンプレート: open-daily-note{}, create-daily-note{date?}, insert-template{templateName?}, list-templates{}
ブックマーク: add-bookmark{path}, remove-bookmark{path}, list-bookmarks{}
キャンバス: canvas-create-text-node{text,x?,y?}, canvas-create-file-node{file,x?,y?}, canvas-create-link-node{url,x?,y?}, canvas-create-group{label?}, canvas-add-edge{fromNode,toNode}, canvas-select-all{}, canvas-zoom-to-fit{}
ワークスペース: open-file{path,mode?}, reveal-in-explorer{path}, get-active-file{}, close-active-leaf{}, split-leaf{direction}

⚠️ コンテンツルール: ノートを作成する際は、「content」パラメータに常に完全なコンテンツを含めてください。「message」でコンテンツを説明せず、paramsに実際のテキストを入れてください。

レスポンス形式（コンパクト、余分なフィールドなし）:
{"actions":[{"action":"name","params":{...}}],"message":"簡単な説明"}

awaitResults=true: 続行する前に結果が必要な場合に使用（list-folder, read-note, search）。結果を受け取った後、次のアクションを生成します。
requiresConfirmation=true: 破壊的アクション（delete, replace-content）に使用。

例 - コンテンツ付きノートを作成:
{"actions":[{"action":"create-note","params":{"path":"Notes/topic.md","content":"# トピック\\n\\n最初の段落。\\n\\n2番目の段落。"}}],"message":"ノートを作成しました"}

例 - ファイルをコピー（2ステップ）:
1: {"actions":[{"action":"list-folder","params":{"path":"Src"}},{"action":"create-folder","params":{"path":"Dst"}}],"message":"一覧表示中","awaitResults":true}
2: {"actions":[{"action":"copy-note","params":{"from":"Src/a.md","to":"Dst/a.md"}},{"action":"copy-note","params":{"from":"Src/b.md","to":"Dst/b.md"}}],"message":"完了"}

ルール:
- copy-noteは正確なコンテンツを保持、コピーにread+createを使用しない
- すべてのアクションを1つのレスポンスに含める、API呼び出しを最小化
- list-folder後、次のレスポンスですべてのコピーを実行（中間ステップなし）
- パスには先頭/末尾のスラッシュなし
- ボールトアクションのない会話では、通常に応答（JSONなし）

ボールト: {{noteCount}}ノート | フォルダ: {{folders}} | タグ: {{tags}}`,

  // Haiku-optimized agent prompt (more verbose and explicit)
  'prompt.agentModeHaiku': `あなたはObsidianボールトアシスタントです。あなたの仕事は、JSONで応答してユーザーのボールトに対してアクションを実行することです。

重要ルール: フォルダ操作では、ファイルのコピー、移動、または削除の前に、実際のファイル名を確認するために必ず最初にlist-folderを使用してください。

利用可能なアクション（メッセージあたり最大{{maxActions}}）:

ファイル操作:
- create-note: 新しいノートを作成。パラメータ: {path: "folder/name.md", content: "完全なテキストコンテンツ", frontmatter?: {key: value}}
  重要: 「content」パラメータに常に完全なコンテンツを含めてください。「message」でコンテンツを説明しないでください。
- read-note: ノートの内容を読み取り。パラメータ: {path: "folder/name.md"}
- delete-note: ノートを削除。パラメータ: {path: "folder/name.md"}
- rename-note: ノートの名前を変更。パラメータ: {from: "old/path.md", to: "new/path.md"}
- move-note: ノートを移動。パラメータ: {from: "source/path.md", to: "dest/path.md"}
- copy-note: ノートをコピー。パラメータ: {from: "source/path.md", to: "dest/path.md"}

フォルダ操作:
- create-folder: フォルダを作成。パラメータ: {path: "folder/name"}
- delete-folder: フォルダを削除。パラメータ: {path: "folder/name"}
- list-folder: フォルダの内容を一覧表示。パラメータ: {path: "folder/name", recursive?: boolean}

コンテンツ操作:
- append-content: 末尾にコンテンツを追加。パラメータ: {path: "file.md", content: "text"}
- prepend-content: 先頭にコンテンツを追加。パラメータ: {path: "file.md", content: "text"}
- replace-content: すべてのコンテンツを置き換え。パラメータ: {path: "file.md", content: "text"}
- update-frontmatter: YAMLフロントマターを更新。パラメータ: {path: "file.md", fields: {key: value}}

検索操作:
- search-notes: ノートを検索。パラメータ: {query: "text", field?: "title|content|tags", folder?: "path"}
- get-note-info: ノートのメタデータを取得。パラメータ: {path: "file.md"}
- find-links: 対象にリンクしているノートを検索。パラメータ: {target: "ノート名"}

レスポンス形式:
常にこのようなJSONオブジェクトで応答してください:
{
  "actions": [
    {"action": "action-name", "params": {...}}
  ],
  "message": "実行内容の簡単な説明"
}

特別なフラグ:
- 「awaitResults」: true - 続行する前にアクション結果を確認する必要がある場合に追加（例：list-folder後）
- 「requiresConfirmation」: true - 破壊的アクション（delete, replace-content）に追加

例 - コンテンツ付きノートを作成:
{
  "actions": [
    {"action": "create-note", "params": {"path": "Notes/my-note.md", "content": "# マイノート\\n\\nこれは実際のコンテンツを含む最初の段落です。\\n\\nこれは別の段落です。", "frontmatter": {"tags": ["例"]}}}
  ],
  "message": "コンテンツ付きノートを作成しました"
}

例 - SourceからDestフォルダにすべてのファイルをコピー:
ステップ1: まずソースフォルダを一覧表示し、宛先を作成
{
  "actions": [
    {"action": "list-folder", "params": {"path": "Source"}},
    {"action": "create-folder", "params": {"path": "Dest"}}
  ],
  "message": "ソースフォルダを一覧表示し、宛先を作成中",
  "awaitResults": true
}

ステップ2: ファイルリストを受け取った後、各ファイルをコピー
{
  "actions": [
    {"action": "copy-note", "params": {"from": "Source/file1.md", "to": "Dest/file1.md"}},
    {"action": "copy-note", "params": {"from": "Source/file2.md", "to": "Dest/file2.md"}}
  ],
  "message": "すべてのファイルを宛先にコピー中"
}

ルール:
1. ファイルのコピーにはcopy-noteを使用 - read-note + create-noteを使用しない
2. 可能な場合はすべてのアクションを1つのレスポンスに含める
3. list-folder後、次のレスポンスですべての操作を実行
4. パスには先頭または末尾のスラッシュを含めない
5. 通常の会話（ボールトアクションなし）では、JSONなしで応答

ボールトコンテキスト:
- 総ノート数: {{noteCount}}
- 既存フォルダ: {{folders}}
- 既存タグ: {{tags}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN TRACKING (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════
  'tokens.sessionCount': '{{count}}トークン',
  'tokens.tooltip': '入力: {{input}} | 出力: {{output}} | 呼び出し: {{calls}}',
  'tokens.modelLabel': 'モデル',
  'tokens.inputLabel': '入力',
  'tokens.outputLabel': '出力',
  'tokens.callsLabel': '呼び出し',
  'tokens.totalLabel': '合計',
  'tokens.today': '今日: {{count}}',
  'tokens.week': '今週: {{count}}',
  'tokens.month': '今月: {{count}}',
  'tokens.allTime': '全期間: {{count}}',
  'tokens.historyLink': '使用履歴',
  'tokens.historyTitle': 'トークン使用履歴',
  'tokens.sessionTitle': '現在のセッション',
  'tokens.closeButton': '閉じる',
  'tokens.byModelTitle': 'モデル別使用量',
  'tokens.noModelData': 'まだモデルデータが記録されていません',
  'status.processing': '処理中...',
  'status.classifying': 'タスクを分類中...',
  'status.executingActions': 'アクションを実行中...',
  'status.waitingResponse': 'レスポンスを待っています...',
  'settings.showTokens.name': 'トークンインジケーターを表示',
  'settings.showTokens.desc': 'チャットフッターにトークン使用量を表示します。',
  'settings.section.tokenTracking': 'トークン追跡',
  'error.quotaExhausted': 'APIクォータを超過しました。console.anthropic.comで使用制限を確認してください。',
  'error.billingIssue': '請求の問題が検出されました。console.anthropic.comでアカウントを確認してください。',
  'error.contentFiltered': 'コンテンツフィルターによりレスポンスがブロックされました。リクエストを言い換えるか、小さなタスクに分割してみてください。',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.contextManagement': 'コンテキスト管理',
  'settings.autoContextManagement.name': '自動コンテキスト管理',
  'settings.autoContextManagement.desc': '会話履歴が長くなった時に自動的に要約してトークン使用量を削減します。',
  'settings.messageSummarizeThreshold.name': '要約するメッセージ数',
  'settings.messageSummarizeThreshold.desc': '自動要約をトリガーするメッセージ数（10-50）。',
  'settings.maxActiveContextMessages.name': '最大アクティブメッセージ数',
  'settings.maxActiveContextMessages.desc': '要約後にアクティブコンテキストに保持する最大メッセージ数（20-100）。',
  'context.summarizing': '会話履歴を要約中...',
  'context.summarized': '会話履歴を要約しました',
  'context.sessionStarted': 'コンテキストセッションを開始しました',
  'context.sessionEnded': 'コンテキストセッションを終了しました',
  'context.summaryPrompt': `ユーザーとAIアシスタント間の以下の会話を要約してください。以下に焦点を当ててください:
1. 議論された主要なトピック
2. 重要な決定または結論
3. 保留中のタスクまたはフォローアップ
4. 会話を続けるために重要なコンテキスト

JSON形式で応答してください:
{
  "keyTopics": ["トピック1", "トピック2"],
  "lastActions": ["アクション1", "アクション2"],
  "summary": "会話の簡単な要約"
}

会話:
{{conversation}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  'welcome.title': 'Claudian',
  'welcome.developedBy': 'Developed by Enigmora',
  'welcome.greeting': '今日はどのようにお手伝いできますか？',
  'welcome.examplesHeader': '私ができることの例:',
  'welcome.example1': '「人工知能についてどんなノートがありますか？」',
  'welcome.example2': '「今週のミーティングの要約を含むノートを作成して」',
  'welcome.example3': '「Ideas.mdノートを読んで、関連ノートへのウィキリンクを提案して」',
  'welcome.example4': '「#projectタグを持つすべてのノートを見つけて、接続のコンセプトマップを生成して」',
  'welcome.example5': '「生産性ノートをトピック別のフォルダに整理して、リンク付きインデックスを作成して」',
  'welcome.agentModeHint': 'ノートを自動的に作成、変更、整理するにはエージェントモードを有効にしてください。',
  // Personalized example templates
  'welcome.template.search': '「{{topic}}についてどんなノートがありますか？」',
  'welcome.template.read': '「「{{noteName}}」ノートを読んで要約して」',
  'welcome.template.create': '「{{topic}}についてのアイデアを含むノートを作成して」',
  'welcome.template.analyze': '「#{{tag}}タグを持つノートを見つけて、それらの接続を提案して」',
  'welcome.template.organize': '「{{topic}}についてのノートをサブトピック別のフォルダに整理してインデックスを作成して」'
};

export default translations;
