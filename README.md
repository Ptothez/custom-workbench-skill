# 为自己做一个工作台

[简体中文](README.md) | [English](README.en.md)

项目多、聊天多，想知道「现在做到哪了、下一步做什么」？这个 Skill 帮你把分散在文件和系统里的进度整理成一个能查看、跳转和更新的工作台。

它会先了解你已有的项目和记录，再设计页面、连接数据并检查实际使用效果。也可以改造现有工作台，例如调整导航、显示待办、连接业务后台。它不是装上就能用的成品软件，需要由 AI 在你的环境里完成实现。


用户反馈需要后续复用时，会保留原话、记录落实结果，再把可跨场景使用的经验提炼为待确认规则。不会照搬作者的项目、私人布局或偏好。

## 安装

```bash
npx -y skills add Ptothez/custom-workbench-skill -g --all
```

安装后可以说：

> 帮我做一个工作台。我希望看到几个项目目前的进度、最重要的下一步，并能点进去继续工作。

提供你已有的文件或系统入口即可。AI 应先读取已知材料，只问影响设计的缺口。

## 使用时会做什么

- 确认你想看什么、记录从哪里来、由谁更新。
- 根据实际项目设计页面，不把所有工作塞进同一套模板。
- 把今天要做的事写清楚，并提供具体入口。
- 检查进入、返回、旧链接和手机布局是否可用。
- 用真实业务案例验证页面里的进度是否可信。

更新方式需要按你的环境实现；安装 Skill 本身不会自动同步聊天，也不会自动创建后台任务。需要外部账号时只在你授权后连接。

## 开发检查

需要支持 Skills 的 AI 客户端。示例与检查脚本使用 Node.js，实际应用可沿用已有技术栈。当前版本 1.3.0。

```bash
node skills/custom-workbench/scripts/test-validate-workbench-spec.mjs
node skills/custom-workbench/scripts/test-decision-contract.mjs
node skills/custom-workbench/scripts/test-navigation-contract.mjs
```

这些检查验证配置和规则；做出的工作台仍需要点击、截图和真实数据验收。仓库不含作者的私人业务数据。

## 许可证

MIT，见 LICENSE。
