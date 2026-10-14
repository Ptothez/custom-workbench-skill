# custom-workbench

设计或改造连接真实记录、判断与执行机制的工作台。版本 1.1.1 区分决策推进台和管理操作台：前者帮助使用者决定先做什么，后者围绕客户、案件、资产等对象推进工作。不把所有场景套成每日三件事；仅打开已有工作台时不使用。

## 主要能力与边界

- 从已有材料提取需求，已确认的条件不重复访谈。
- 决策型支持目标与候选来源、排序口径、提案与本人确认、更新链路和明确降级。
- 管理型保留对象层级、沟通时间线、数据权限与操作路径。
- 提案、确认安排、实际执行和完成证据分开；确认计划不等于授权对外操作。
- 按真实业务案例、交互和视觉分别验收，不以页面能打开代替业务有效。

## 安装

```bash
npx -y skills add Ptothez/custom-workbench-skill -g --all
```

## 使用

安装后，可以这样开始：

> 使用 $custom-workbench 先了解我的工作方式，再为我设计并构建一个真正可用的定制工作台。

## 运行依赖

- 支持 Agent Skills 的客户端
- Node.js（运行 JSON 契约校验和正反例测试）；具体实现沿用目标项目的技术栈

## 契约与测试

新规格采用 1.1，分别提供管理操作和决策提案示例；旧 1.0 规格保持兼容。

```bash
node skills/custom-workbench/scripts/test-validate-workbench-spec.mjs
node skills/custom-workbench/scripts/test-decision-contract.mjs
```

这些命令验证契约与拒绝错误输入，不证明目标工作台已实现或实际业务重点始终正确。

## 内容

本仓库只发布运行这个 Skill 所需的文件。本地评测样本、预期答案和运行记录不包含在公开包中。

## 许可证

[MIT](LICENSE)
