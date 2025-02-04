# Gopeed Extension Huggingface

## Installation

在插件页面输入`https://github.com/DSYZayn/gopeed-extension-huggingface.git`下载即可安装

## Usage

满足以下格式的链接即可解析该文件夹下所有文件

- 不支持递归解析，因为gopeed不支持自动创建文件夹
- 若要使用modelscope， 则需要该模型或数据集在huggingface中存在，否则无法解析。

`https://<baseUrl>/<user>/<repoType>/<repo>/tree/main/<path>`

- **baseUrl**: huggingface.co || hf-mirror.com || www.modelscope.cn
- **user**: 用户名(组织名), 如deepseek-ai
- **repoType**: models || datasets
- **path**: 文件夹路径， 如果是根目录则不填, 连同`main/`最后的`/`一起去掉

示例：

1. 下载unsloth/DeepSeek-R1-GGUF的根目录文件：`https://huggingface.co/models/unsloth/DeepSeek-R1-GGUF/tree/main`
2. 下载unsloth/DeepSeek-R1-GGUF的`Deepseek-R1-BF16`文件夹：`https://huggingface.co/models/unsloth/DeepSeek-R1-GGUF/tree/main/Deepseek-R1-BF16`

tips: 以上两个链接中`models/`可以省略

1. 下载open-thoughts/OpenThoughts-114k的根目录文件：`https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k/tree/main`
2. 下载open-thoughts/OpenThoughts-114k的`data`文件夹：`https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k/tree/main/data`

tips: 以上两个链接中`datasets/`绝对不能省略

## Demo

<img src="https://github.com/DSYZayn/gopeed-extension-huggingface/blob/main/demo.png" alt="demo" width="800">
