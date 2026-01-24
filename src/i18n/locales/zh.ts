import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': 'Claudian - 设置',
  'settings.description': 'Obsidian 的 Claude AI 集成插件，由 Enigmora 开发。与 Claude 聊天，处理笔记以获取智能标签和维基链接建议，并使用代理模式通过自然语言管理您的知识库。隐私优先：API 密钥本地存储。',
  'settings.language.name': '语言',
  'settings.language.desc': '插件界面语言。"自动"从 Obsidian 设置中检测。',
  'settings.language.auto': '自动（从 Obsidian 检测）',
  'settings.apiKey.name': 'API 密钥',
  'settings.apiKey.descPart1': '在此获取您的 Anthropic API 密钥：',
  'settings.apiKey.descPart2': '。密钥本地存储在您的知识库中。',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': '模型',
  'settings.model.desc': '选择要使用的 Claude 模型。',
  'settings.model.sonnet4': 'Claude Sonnet 4（推荐）',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku45': 'Claude Haiku 4.5（快速）',
  // Execution Mode (Model Orchestrator)
  'settings.executionMode.name': '执行模式',
  'settings.executionMode.desc': 'Claude 如何为您的任务选择模型。',
  'settings.executionMode.automatic': '自动（推荐）',
  'settings.executionMode.automaticDesc': '智能路由：简单任务使用 Haiku，复杂任务使用 Sonnet，深度分析使用 Opus。',
  'settings.executionMode.economic': '经济模式',
  'settings.executionMode.economicDesc': '所有任务使用 Haiku。最快且最实惠。',
  'settings.executionMode.maxQuality': '最高质量',
  'settings.executionMode.maxQualityDesc': '所有任务使用 Opus。最适合复杂分析和写作。',
  'settings.executionMode.currentModel': '当前使用：{{model}}',
  'settings.folder.name': '笔记文件夹',
  'settings.folder.desc': '从聊天生成的笔记将保存到此文件夹。',
  'settings.folder.placeholder': 'Claudian',
  'settings.maxTokens.name': '最大令牌数',
  'settings.maxTokens.desc': '响应中的最大令牌数（1000-8192）。',
  'settings.customInstructions.name': '自定义指令',
  'settings.customInstructions.desc': '用于个性化 Claude 行为的附加指令。这些将添加到基础指令中（不会替换）。',
  'settings.customInstructions.placeholder': '例如：始终使用正式中文回复，使用项目符号...',
  'settings.customInstructions.clear': '清除',
  'settings.customInstructions.cleared': '自定义指令已清除',
  'settings.section.noteProcessing': '笔记处理',
  'settings.maxNotesContext.name': '上下文中的最大笔记数',
  'settings.maxNotesContext.desc': '处理时包含的最大笔记标题数（10-500）。',
  'settings.maxTagsContext.name': '上下文中的最大标签数',
  'settings.maxTagsContext.desc': '处理时包含的最大现有标签数（10-200）。',
  'settings.section.agentMode': '代理模式',
  'settings.agentEnabled.name': '默认启用代理模式',
  'settings.agentEnabled.desc': '代理模式允许 Claude 在您的知识库上执行操作。',
  'settings.confirmDestructive.name': '确认破坏性操作',
  'settings.confirmDestructive.desc': '在删除文件或替换内容前请求确认。',
  'settings.protectedFolders.name': '受保护的文件夹',
  'settings.protectedFolders.desc': '代理无法修改的文件夹（用逗号分隔）。',
  'settings.protectedFolders.placeholder': '.obsidian, templates',
  'settings.maxActions.name': '每条消息的最大操作数',
  'settings.maxActions.desc': 'Claude 在单条消息中可执行的操作限制（1-20）。',
  'settings.footer.license': '基于 MIT 许可证',
  'settings.footer.developedBy': '开发者',
  'settings.footer.sourceCode': '源代码',

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  'chat.placeholder': '输入您的消息...',
  'chat.send': '发送',
  'chat.clearLabel': '清除聊天',
  'chat.cleared': '聊天已清除',
  'chat.agentLabel': '代理',
  'chat.agentEnabled': '代理模式已启用',
  'chat.agentDisabled': '代理模式已禁用',
  'chat.copyLabel': '复制',
  'chat.copied': '已复制到剪贴板',
  'chat.createNoteLabel': '创建笔记',
  'chat.actionsExecuted': '已执行 {{count}} 个操作',
  'chat.actionsPartial': '{{success}} 个成功，{{failed}} 个失败',
  'chat.actionsCancelled': '操作已被用户取消。',
  'chat.error': '错误：{{message}}',
  'chat.errorUnknown': '未知错误',
  'chat.stop': '停止',
  'chat.streamStopped': '响应已被用户停止',

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': 'API 密钥未配置。请前往设置 > Claudian。',
  'error.apiKeyInvalid': 'API 密钥无效。请在设置中检查您的密钥。',
  'error.rateLimit': '请求频率超限。请稍后重试。',
  'error.connection': '连接错误。请检查您的网络连接。',
  'error.unknown': '与 Claude 通信时发生未知错误。',
  'error.noActiveNote': '没有活动的 Markdown 笔记。',
  'error.parseJson': '响应中未找到有效的 JSON。',
  'error.parseResponse': '解析建议 JSON 时出错。',
  'error.tooManyActions': '操作过多（{{count}} 个）。最大允许：{{max}}',
  // Vault action errors
  'error.protectedPath': '受保护的路径：{{path}}',
  'error.folderNotFound': '文件夹未找到：{{path}}',
  'error.folderNotEmpty': '文件夹不为空：{{path}}',
  'error.fileAlreadyExists': '文件已存在：{{path}}。使用 overwrite: true 覆盖。',
  'error.noteNotFound': '笔记未找到：{{path}}',
  'error.sourceNoteNotFound': '源笔记未找到：{{path}}',
  'error.fileNotFound': '文件未找到：{{path}}',
  'error.momentNotAvailable': 'Moment.js 不可用',
  'error.noActiveLeafToSplit': '没有可分割的活动标签页',
  'error.unknownError': '未知错误',
  // Concept map errors
  'error.conceptMapParse': '解析概念图时出错',
  'error.noValidJsonInResponse': '响应中未找到有效的 JSON',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE CREATOR MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'noteCreator.title': '从聊天创建笔记',
  'noteCreator.preview': '预览',
  'noteCreator.titleField.name': '标题',
  'noteCreator.titleField.desc': '文件名（不含 .md 扩展名）',
  'noteCreator.tags.name': '标签',
  'noteCreator.tags.desc': '用逗号分隔',
  'noteCreator.tags.placeholder': '标签1, 标签2, 标签3',
  'noteCreator.folder.name': '文件夹',
  'noteCreator.folder.desc': '笔记的目标文件夹',
  'noteCreator.cancel': '取消',
  'noteCreator.create': '创建笔记',
  'noteCreator.titleRequired': '标题为必填项',
  'noteCreator.fileExists': '已存在同名文件：{{name}}',
  'noteCreator.created': '笔记已创建：{{path}}',
  'noteCreator.error': '创建笔记时出错：{{message}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'batch.titleExtraction': '批量处理',
  'batch.titleConceptMap': '生成概念图',
  'batch.selectNotes': '选择笔记',
  'batch.selectFolder': '选择文件夹',
  'batch.selectAll': '全选',
  'batch.clear': '清除',
  'batch.counter': '已选择 {{count}} 篇笔记',
  'batch.noNotes': '知识库中没有笔记',
  'batch.rootFolder': '根目录',
  'batch.selectTemplate': '选择模板',
  'batch.mapOptions': '图表选项',
  'batch.mapTitle': '图表标题：',
  'batch.mapTitlePlaceholder': '我的概念图',
  'batch.cancel': '取消',
  'batch.processNotes': '处理笔记',
  'batch.generateMap': '生成图表',
  'batch.selectAtLeastOne': '请至少选择一篇笔记',
  'batch.selectTemplateRequired': '请选择一个模板',
  'batch.starting': '正在开始处理...',
  'batch.processing': '正在处理 {{current}}/{{total}}：{{note}}',
  'batch.completed': '完成：{{success}} 个成功，{{errors}} 个错误',
  'batch.savedTo': '结果已保存至：{{path}}',
  'batch.analyzing': '正在分析笔记...',
  'batch.saving': '正在保存图表...',
  'batch.mapGenerated': '图表生成成功',
  'batch.errorProcessing': '处理过程中出错',
  'batch.errorGenerating': '生成图表时出错',
  'batch.folderPrompt': '请输入文件夹名称：',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'confirmation.title': '确认操作',
  'confirmation.description': '以下操作需要确认：',
  'confirmation.warning': '此操作无法撤销。',
  'confirmation.cancel': '取消',
  'confirmation.confirm': '确认',
  'confirmation.deleteNote': '删除笔记：{{path}}',
  'confirmation.deleteFolder': '删除文件夹：{{path}}',
  'confirmation.replaceContent': '替换内容：{{path}}',
  'confirmation.overwriteNote': '覆盖现有文件：{{path}}',
  'confirmation.moveNote': '移动：{{from}} → {{to}}',
  'confirmation.renameNote': '重命名：{{from}} → {{to}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'suggestions.title': '笔记建议',
  'suggestions.tags': '建议的标签',
  'suggestions.tagsEmpty': '没有标签建议。',
  'suggestions.selectAll': '全选',
  'suggestions.applySelected': '应用所选',
  'suggestions.wikilinks': '建议的维基链接',
  'suggestions.wikilinksEmpty': '没有维基链接建议。',
  'suggestions.badgeExists': '已存在',
  'suggestions.badgeNew': '新建',
  'suggestions.selectExisting': '选择现有',
  'suggestions.insertSelected': '插入所选',
  'suggestions.atomicConcepts': '原子概念',
  'suggestions.atomicConceptsEmpty': '没有建议的原子概念。',
  'suggestions.viewContent': '查看内容',
  'suggestions.createNote': '创建笔记',
  'suggestions.noteCreated': '已创建',
  'suggestions.tagsApplied': '已应用 {{count}} 个标签。',
  'suggestions.wikilinksInserted': '已插入 {{count}} 个维基链接。',

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  'command.openChat': '打开与 Claude 的聊天',
  'command.processNote': '使用 Claude 处理活动笔记',
  'command.batchProcess': '批量处理笔记',
  'command.generateMap': '生成概念图',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE PROCESSOR
  // ═══════════════════════════════════════════════════════════════════════════
  'processor.reading': '正在读取笔记内容...',
  'processor.analyzing': '正在使用 Claude 分析...',
  'processor.processing': '正在使用 Claude 处理笔记...',
  'processor.relatedLinks': '相关链接',

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  'agent.actionsExecuted': '操作已执行',
  'agent.noActions': '无法执行操作：',
  'agent.actionsFailed': '{{count}} 个操作失败。',
  'agent.partialSuccess': '结果：',
  'agent.loopLimitReached': '已达到循环限制。请手动继续。',
  'agent.processingResults': '正在处理结果（步骤 {{step}}）...',
  'agent.createFolder': '创建文件夹：{{path}}',
  'agent.deleteFolder': '删除文件夹：{{path}}',
  'agent.listFolder': '列出文件夹：{{path}}',
  'agent.createNote': '创建笔记：{{path}}',
  'agent.readNote': '读取笔记：{{path}}',
  'agent.deleteNote': '删除笔记：{{path}}',
  'agent.renameNote': '重命名：{{from}} → {{to}}',
  'agent.moveNote': '移动：{{from}} → {{to}}',
  'agent.copyNote': '复制：{{from}} → {{to}}',
  'agent.appendContent': '追加内容到：{{path}}',
  'agent.prependContent': '前置内容到：{{path}}',
  'agent.replaceContent': '替换内容：{{path}}',
  'agent.updateFrontmatter': '更新前置信息：{{path}}',
  'agent.searchNotes': '搜索笔记："{{query}}"',
  'agent.getNoteInfo': '获取信息：{{path}}',
  'agent.findLinks': '查找链接到：{{target}}',
  // Editor API actions
  'agent.editorGetContent': '获取编辑器内容',
  'agent.editorSetContent': '设置编辑器内容',
  'agent.editorGetSelection': '获取选中文本',
  'agent.editorReplaceSelection': '替换选中内容为：{{text}}',
  'agent.editorInsertAtCursor': '在光标处插入：{{text}}',
  'agent.editorGetLine': '获取第 {{line}} 行',
  'agent.editorSetLine': '设置第 {{line}} 行',
  'agent.editorGoToLine': '跳转到第 {{line}} 行',
  'agent.editorUndo': '撤销',
  'agent.editorRedo': '重做',
  // Commands API actions
  'agent.executeCommand': '执行命令：{{commandId}}',
  'agent.listCommands': '列出命令',
  'agent.getCommandInfo': '获取命令信息：{{commandId}}',
  // Daily Notes actions
  'agent.openDailyNote': '打开日记',
  'agent.createDailyNote': '创建日记：{{date}}',
  // Templates actions
  'agent.insertTemplate': '插入模板：{{templateName}}',
  'agent.listTemplates': '列出模板',
  // Bookmarks actions
  'agent.addBookmark': '添加书签：{{path}}',
  'agent.removeBookmark': '移除书签：{{path}}',
  'agent.listBookmarks': '列出书签',
  // Canvas API actions
  'agent.canvasCreateTextNode': '创建文本节点：{{text}}',
  'agent.canvasCreateFileNode': '创建文件节点：{{file}}',
  'agent.canvasCreateLinkNode': '创建链接节点：{{url}}',
  'agent.canvasCreateGroup': '创建分组：{{label}}',
  'agent.canvasAddEdge': '添加连接：{{fromNode}} → {{toNode}}',
  'agent.canvasSelectAll': '全选画布节点',
  'agent.canvasZoomToFit': '缩放适应画布',
  // Enhanced Search actions
  'agent.searchByHeading': '按标题搜索：{{heading}}',
  'agent.searchByBlock': '按块 ID 搜索：{{blockId}}',
  'agent.getAllTags': '获取所有标签',
  'agent.openSearch': '打开搜索：{{query}}',
  // Workspace actions
  'agent.openFile': '打开文件：{{path}}',
  'agent.revealInExplorer': '在资源管理器中显示：{{path}}',
  'agent.getActiveFile': '获取活动文件信息',
  'agent.closeActiveLeaf': '关闭活动标签页',
  'agent.splitLeaf': '分割视图：{{direction}}',
  // Error messages for new actions
  'error.noActiveEditor': '没有活动的编辑器。请先打开一个 Markdown 文件。',
  'error.noActiveCanvas': '没有活动的画布。请先打开一个画布文件。',
  'error.pluginNotEnabled': '插件 "{{plugin}}" 未启用。',
  'error.commandNotFound': '命令未找到：{{commandId}}',
  'error.templateNotFound': '模板未找到：{{templateName}}',
  'error.bookmarkNotFound': '书签未找到：{{path}}',
  'error.canvasNodeNotFound': '画布节点未找到：{{nodeId}}',
  'error.headingNotFound': '未找到包含标题的笔记：{{heading}}',
  'error.blockNotFound': '块未找到：{{blockId}}',
  'agent.genericAction': '操作：{{action}}',
  'agent.progressStarting': '正在开始执行...',
  'agent.progressStatus': '正在执行 {{current}}/{{total}}',
  'agent.generatingResponse': '正在生成响应...',
  'agent.streamingChars': '字符数：',
  'agent.streamingActions': '检测到的操作：',
  'agent.showRawResponse': '▶ 显示原始响应',
  'agent.hideRawResponse': '▼ 隐藏原始响应',
  'agent.warningTitle': '需要代理模式',
  'agent.warningDescription': '看起来您想要创建、修改或整理知识库中的文件。这需要启用代理模式。',
  'agent.enableAgentMode': '启用代理模式',
  'agent.continueAnyway': '继续而不启用',
  'agent.continuing': '正在继续响应...',
  'agent.retryWithJson': '使用 JSON 格式重试',
  'agent.planningTask': '正在规划复杂任务...',
  'agent.executingSubtask': '正在执行 {{current}}/{{total}}：{{description}}',
  'agent.subtask.preparation': '准备结构',
  'agent.subtask.execution': '执行主任务',
  'agent.planSummary.header': '任务完成：{{completed}}/{{total}} 个子任务',
  'agent.planSummary.successful': '**成功：**',
  'agent.planSummary.failed': '**失败：**',
  'agent.planningPrompt': `将此复杂任务分解为子任务，每个子任务最多可用 {{maxActions}} 个操作完成。

任务：{{request}}

预估总操作数：{{estimatedActions}}
最大子任务数：{{maxSubtasks}}

请用 JSON 格式回复：
{
  "subtasks": [
    {
      "id": "subtask-1",
      "description": "此子任务的简要描述",
      "prompt": "执行此子任务的具体指令",
      "dependencies": []
    }
  ],
  "estimatedTotalActions": 数字
}

重要提示：
- 每个子任务应该独立或有明确的依赖关系
- 按逻辑顺序排列子任务（例如：先创建文件夹，再在其中创建文件）
- 保持提示具体且可操作`,
  'agent.reinforcement.reminder': '您正处于代理模式。请使用 JSON 格式执行知识库操作。',
  'agent.reinforcement.canPerformActions': '您可以在此知识库中创建、修改和删除文件。不要说您不能 - 请使用操作系统。',
  'agent.reinforcement.useJsonFormat': '当用户请求知识库操作时，请用包含 "actions" 数组的 JSON 格式回复。',
  'agent.reinforcement.dontForget': '请记住：您有完全的能力通过操作系统管理此 Obsidian 知识库。',
  'agent.reinforcement.recoveryPrompt': `用户问："{{message}}"

您正处于代理模式，可以执行知识库操作。请用适当的 JSON 格式回复：
{
  "actions": [{"action": "...", "params": {...}}],
  "message": "...",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.confusion': '您可以在此知识库中创建和修改文件。请按照指令中指定的 JSON 格式提供操作。',
  'agent.retryPrompt.missingJson': `您描述了操作但没有提供 JSON 格式。基于您所说的："{{context}}..."

请提供确切的操作 JSON：
{
  "actions": [{"action": "操作名称", "params": {...}}],
  "message": "操作描述",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.incompleteJson': '您的响应被截断了。请继续并完成 JSON 结构。',
  'agent.retryPrompt.generic': '请以所需的 JSON 格式提供知识库操作，包含 "actions"、"message" 和 "requiresConfirmation" 字段。',
  // Agentic Loop (Phase 2)
  'agent.loopCancelled': '代理循环已被用户取消。',
  'agent.cancelLoop': '取消',
  'agent.allActionsFailed': '所有操作均失败。循环已停止以防止更多错误。',
  'agent.infiniteLoopDetected': '检测到无限循环（重复操作）。操作已停止。',
  // Agentic Loop UX (Phase 3)
  'agent.loopProgress': '步骤 {{current}}/最多 {{max}}',
  'agent.loopTokens': '↑{{input}} ↓{{output}}',
  'agent.loopTokenSummary': '令牌使用量：↑{{input}} 输入，↓{{output}} 输出',
  'agent.loopStep': '步骤 {{step}}',
  'agent.loopStepFinal': '已完成',
  'agent.loopExpandStep': '显示更多...',
  'agent.loopCollapseStep': '显示更少',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': '模型似乎对其能力感到困惑。它可以在代理模式下执行知识库操作。',
  'warning.actionClaimsNoJson': '响应声称已执行操作，但未找到可执行的操作。',
  'warning.emptyActionsArray': '响应包含空的操作数组。',
  'warning.incompleteJson': 'JSON 响应似乎不完整或被截断。',
  'warning.actionMismatch': '声明的操作与提供的操作不匹配：{{mismatches}}',
  'suggestion.remindAgentMode': '尝试提醒模型代理模式已激活。',
  'suggestion.requestJsonFormat': '请求以正确的 JSON 格式响应。',
  'suggestion.requestContinuation': '请求模型继续并完成其响应。',
  'validation.valid': '响应验证成功。',
  'validation.validWithNotes': '响应有效，有少量注意事项。',

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': '高级代理选项',
  'settings.autoContinue.name': '自动继续截断的响应',
  'settings.autoContinue.desc': '当响应似乎被截断时自动请求继续。',
  'settings.autoPlan.name': '自动规划复杂任务',
  'settings.autoPlan.desc': '自动将复杂任务分解为较小的子任务。',
  'settings.contextReinforce.name': '强化代理上下文',
  'settings.contextReinforce.desc': '添加提醒以防止模型在长对话中忘记代理模式。',

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  'template.keyIdeas.name': '提取关键想法',
  'template.keyIdeas.desc': '识别并总结内容中的主要想法',
  'template.summary.name': '执行摘要',
  'template.summary.desc': '生成简洁的摘要以便快速阅读',
  'template.questions.name': '识别待解决问题',
  'template.questions.desc': '检测未解决的问题或探索领域',
  'template.actions.name': '提取行动项',
  'template.actions.desc': '识别内容中提到的任务和行动',
  'template.concepts.name': '概念和定义',
  'template.concepts.desc': '提取重要术语及其定义',
  'template.connections.name': '连接和关系',
  'template.connections.desc': '识别概念之间的关系以创建链接',

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════
  'prompt.baseIdentity': `Claude 通过 Claudian（由 Enigmora 开发）集成到 Obsidian。适当时使用 Markdown 和维基链接（[[笔记]]）。保持简洁。`,

  'prompt.chatMode': `重要提示 - 代理模式：
如果用户要求您在知识库上执行操作（创建、移动、删除、重命名笔记或文件夹、修改内容等），而代理模式当前未启用，您必须告知他们：
"要在您的知识库上执行操作，请使用聊天顶部的开关启用**代理模式**。"
在代理模式未启用的情况下，不要尝试描述或模拟知识库操作。`,

  'prompt.noteProcessor': `您是专门为 Obsidian 进行知识组织的助手。您的任务是分析笔记并建议改进，以便更好地将它们整合到用户的知识库中。

知识库上下文：
- 笔记总数：{{noteCount}}
- 现有笔记：{{noteTitles}}
- 现有标签：{{allTags}}

指令：
1. 分析提供的笔记内容
2. 建议相关标签（最好从现有标签中选择，但可以提出新标签）
3. 识别可以链接到现有笔记的概念（维基链接）
4. 检测值得单独成为笔记的原子概念
5. 简要解释您的推理

仅用以下确切结构的有效 JSON 对象回复：
{
  "tags": ["标签1", "标签2"],
  "wikilinks": [
    {
      "text": "要转换为链接的文本",
      "target": "目标笔记标题",
      "context": "为何链接的简要说明"
    }
  ],
  "atomicConcepts": [
    {
      "title": "新笔记的标题",
      "summary": "1-2 句摘要",
      "content": "建议的笔记内容（Markdown 格式）"
    }
  ],
  "reasoning": "分析的简要说明"
}

重要提示：
- 仅建议链接到知识库中存在的笔记
- 标签不应包含 # 符号
- 原子概念应该是值得单独发展的想法
- 保持建议相关且有用，不要填充不必要的链接`,

  'prompt.templateProcessor': `您是专门分析和从文本中提取信息的助手。
请根据提供的指令以结构化和清晰的方式回复。
{{jsonInstructions}}`,

  'prompt.conceptMapGenerator': `您是专门进行知识分析和创建概念图的助手。
您的任务是识别笔记集中的概念、关系和跨领域主题。
重要提示：仅用根据请求格式的有效 JSON 回复。`,

  'prompt.agentMode': `Obsidian 知识库助手。通过 JSON 响应执行操作。

⚠️ 关键：对于文件夹操作，始终先使用 list-folder 获取真实文件名。

操作（每条消息最多 {{maxActions}} 个）：
文件：create-note{path,content,frontmatter?}、read-note{path}、delete-note{path}、rename-note{from,to}、move-note{from,to}、copy-note{from,to}
文件夹：create-folder{path}、delete-folder{path}、list-folder{path,recursive?}
内容：append-content{path,content}、prepend-content{path,content}、replace-content{path,content}、update-frontmatter{path,fields}
搜索：search-notes{query,field?,folder?}、get-note-info{path}、find-links{target}、search-by-heading{heading,folder?}、search-by-block{blockId}、get-all-tags{}、open-search{query}
编辑器：editor-get-content{}、editor-set-content{content}、editor-get-selection{}、editor-replace-selection{text}、editor-insert-at-cursor{text}、editor-get-line{line}、editor-set-line{line,text}、editor-go-to-line{line}、editor-undo{}、editor-redo{}
命令：execute-command{commandId}、list-commands{filter?}、get-command-info{commandId}
日记/模板：open-daily-note{}、create-daily-note{date?}、insert-template{templateName?}、list-templates{}
书签：add-bookmark{path}、remove-bookmark{path}、list-bookmarks{}
画布：canvas-create-text-node{text,x?,y?}、canvas-create-file-node{file,x?,y?}、canvas-create-link-node{url,x?,y?}、canvas-create-group{label?}、canvas-add-edge{fromNode,toNode}、canvas-select-all{}、canvas-zoom-to-fit{}
工作区：open-file{path,mode?}、reveal-in-explorer{path}、get-active-file{}、close-active-leaf{}、split-leaf{direction}

⚠️ 内容规则：创建笔记时，始终在 "content" 参数中包含完整内容。不要在 "message" 中描述内容 - 将实际文本放在 params 中。

响应格式（紧凑，无额外字段）：
{"actions":[{"action":"名称","params":{...}}],"message":"简要描述"}

awaitResults=true：当您需要在继续之前查看结果时使用（list-folder、read-note、search）。您将收到结果，然后生成下一步操作。
requiresConfirmation=true：用于破坏性操作（delete、replace-content）。

示例 - 创建带内容的笔记：
{"actions":[{"action":"create-note","params":{"path":"笔记/主题.md","content":"# 主题\\n\\n第一段在这里。\\n\\n第二段。"}}],"message":"笔记已创建"}

示例 - 复制文件（2 步）：
1: {"actions":[{"action":"list-folder","params":{"path":"源"}},{"action":"create-folder","params":{"path":"目标"}}],"message":"正在列出","awaitResults":true}
2: {"actions":[{"action":"copy-note","params":{"from":"源/a.md","to":"目标/a.md"}},{"action":"copy-note","params":{"from":"源/b.md","to":"目标/b.md"}}],"message":"完成"}

规则：
- copy-note 保留精确内容；切勿使用 read+create 进行复制
- 在一个响应中包含所有操作；最小化 API 调用
- list-folder 后，在下一个响应中执行所有复制（无中间步骤）
- 路径不带前导/尾随斜杠
- 对于没有知识库操作的对话，正常回复（无 JSON）

知识库：{{noteCount}} 篇笔记 | 文件夹：{{folders}} | 标签：{{tags}}`,

  // Haiku-optimized agent prompt (more verbose and explicit)
  'prompt.agentModeHaiku': `您是 Obsidian 知识库助手。您的工作是通过 JSON 响应在用户的知识库上执行操作。

关键规则：对于任何文件夹操作，您必须先使用 list-folder 查看实际文件名，然后再复制、移动或删除文件。

可用操作（每条消息最多 {{maxActions}} 个）：

文件操作：
- create-note：创建新笔记。参数：{path: "文件夹/名称.md", content: "完整文本内容", frontmatter?: {键: 值}}
  重要：始终在 "content" 参数中包含完整内容。切勿在 "message" 中描述内容。
- read-note：读取笔记内容。参数：{path: "文件夹/名称.md"}
- delete-note：删除笔记。参数：{path: "文件夹/名称.md"}
- rename-note：重命名笔记。参数：{from: "旧/路径.md", to: "新/路径.md"}
- move-note：移动笔记。参数：{from: "源/路径.md", to: "目标/路径.md"}
- copy-note：复制笔记。参数：{from: "源/路径.md", to: "目标/路径.md"}

文件夹操作：
- create-folder：创建文件夹。参数：{path: "文件夹/名称"}
- delete-folder：删除文件夹。参数：{path: "文件夹/名称"}
- list-folder：列出文件夹内容。参数：{path: "文件夹/名称", recursive?: boolean}

内容操作：
- append-content：在末尾添加内容。参数：{path: "文件.md", content: "文本"}
- prepend-content：在开头添加内容。参数：{path: "文件.md", content: "文本"}
- replace-content：替换全部内容。参数：{path: "文件.md", content: "文本"}
- update-frontmatter：更新 YAML 前置信息。参数：{path: "文件.md", fields: {键: 值}}

搜索操作：
- search-notes：搜索笔记。参数：{query: "文本", field?: "title|content|tags", folder?: "路径"}
- get-note-info：获取笔记元数据。参数：{path: "文件.md"}
- find-links：查找链接到目标的笔记。参数：{target: "笔记名称"}

响应格式：
始终用这样的 JSON 对象回复：
{
  "actions": [
    {"action": "操作名称", "params": {...}}
  ],
  "message": "简要描述将要执行的操作"
}

特殊标志：
- 当您需要在继续之前查看操作结果时添加 "awaitResults": true（例如：list-folder 之后）
- 对于破坏性操作添加 "requiresConfirmation": true（delete、replace-content）

示例 - 创建带内容的笔记：
{
  "actions": [
    {"action": "create-note", "params": {"path": "笔记/我的笔记.md", "content": "# 我的笔记\\n\\n这是第一段包含实际内容。\\n\\n这是另一段。", "frontmatter": {"tags": ["示例"]}}}
  ],
  "message": "已创建带内容的笔记"
}

示例 - 将所有文件从源文件夹复制到目标文件夹：
步骤 1：首先列出源文件夹并创建目标
{
  "actions": [
    {"action": "list-folder", "params": {"path": "源"}},
    {"action": "create-folder", "params": {"path": "目标"}}
  ],
  "message": "正在列出源文件夹并创建目标",
  "awaitResults": true
}

步骤 2：收到文件列表后，复制每个文件
{
  "actions": [
    {"action": "copy-note", "params": {"from": "源/文件1.md", "to": "目标/文件1.md"}},
    {"action": "copy-note", "params": {"from": "源/文件2.md", "to": "目标/文件2.md"}}
  ],
  "message": "正在将所有文件复制到目标"
}

规则：
1. 使用 copy-note 复制文件 - 不要使用 read-note + create-note
2. 尽可能在一个响应中包含所有操作
3. list-folder 后，在下一个响应中执行所有操作
4. 路径不应有前导或尾随斜杠
5. 对于普通对话（非知识库操作），无需 JSON 回复

知识库上下文：
- 笔记总数：{{noteCount}}
- 现有文件夹：{{folders}}
- 现有标签：{{tags}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN TRACKING (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════
  'tokens.sessionCount': '{{count}} 令牌',
  'tokens.tooltip': '输入：{{input}} | 输出：{{output}} | 调用：{{calls}}',
  'tokens.modelLabel': '模型',
  'tokens.inputLabel': '输入',
  'tokens.outputLabel': '输出',
  'tokens.callsLabel': '调用',
  'tokens.totalLabel': '总计',
  'tokens.today': '今天：{{count}}',
  'tokens.week': '本周：{{count}}',
  'tokens.month': '本月：{{count}}',
  'tokens.allTime': '全部：{{count}}',
  'tokens.historyLink': '使用历史',
  'tokens.historyTitle': '令牌使用历史',
  'tokens.sessionTitle': '当前会话',
  'tokens.closeButton': '关闭',
  'tokens.byModelTitle': '按模型使用量',
  'tokens.noModelData': '尚无模型数据',
  'status.processing': '处理中...',
  'status.classifying': '正在分类任务...',
  'status.executingActions': '正在执行操作...',
  'status.waitingResponse': '等待响应...',
  'settings.showTokens.name': '显示令牌指示器',
  'settings.showTokens.desc': '在聊天底部显示令牌使用量。',
  'settings.section.tokenTracking': '令牌追踪',
  'error.quotaExhausted': 'API 配额已用尽。请在 console.anthropic.com 检查您的使用限制。',
  'error.billingIssue': '检测到计费问题。请在 console.anthropic.com 检查您的账户。',
  'error.contentFiltered': '响应被内容过滤器阻止。请尝试重新表述您的请求或将其分解为较小的任务。',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.contextManagement': '上下文管理',
  'settings.autoContextManagement.name': '自动上下文管理',
  'settings.autoContextManagement.desc': '当对话历史变长时自动总结以减少令牌使用。',
  'settings.messageSummarizeThreshold.name': '消息数阈值',
  'settings.messageSummarizeThreshold.desc': '触发自动总结前的消息数量（10-50）。',
  'settings.maxActiveContextMessages.name': '最大活动消息数',
  'settings.maxActiveContextMessages.desc': '总结后保留在活动上下文中的最大消息数（20-100）。',
  'context.summarizing': '正在总结对话历史...',
  'context.summarized': '对话历史已总结',
  'context.sessionStarted': '上下文会话已开始',
  'context.sessionEnded': '上下文会话已结束',
  'context.summaryPrompt': `总结以下用户与 AI 助手之间的对话。重点关注：
1. 讨论的关键话题
2. 重要的决定或结论
3. 待办任务或后续事项
4. 继续对话所需的重要上下文

请用 JSON 格式回复：
{
  "keyTopics": ["话题1", "话题2"],
  "lastActions": ["操作1", "操作2"],
  "summary": "对话的简要总结"
}

对话内容：
{{conversation}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  'welcome.title': 'Claudian',
  'welcome.developedBy': '由 Enigmora 开发',
  'welcome.greeting': '今天我能帮您做什么？',
  'welcome.examplesHeader': '我能做的事情示例：',
  'welcome.example1': '"我有哪些关于人工智能的笔记？"',
  'welcome.example2': '"创建一篇本周会议摘要的笔记"',
  'welcome.example3': '"读取我的 Ideas.md 笔记并建议相关笔记的维基链接"',
  'welcome.example4': '"查找所有带有 #项目 标签的笔记并生成它们之间的概念图"',
  'welcome.example5': '"按主题将我的生产力笔记整理到文件夹中并创建链接索引"',
  'welcome.agentModeHint': '启用代理模式可自动创建、修改和整理笔记。',
  // Personalized example templates
  'welcome.template.search': '"我有哪些关于{{topic}}的笔记？"',
  'welcome.template.read': '"读取我的"{{noteName}}"笔记并给我做个摘要"',
  'welcome.template.create': '"创建一篇关于{{topic}}的想法笔记"',
  'welcome.template.analyze': '"查找带有 #{{tag}} 标签的笔记并建议它们之间的联系"',
  'welcome.template.organize': '"按子主题将我关于{{topic}}的笔记整理到文件夹中并创建索引"'
};

export default translations;
