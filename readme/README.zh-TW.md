<!--
 * @Author: zayn 1546492103@qq.com
 * @Date: 2025-02-04 02:34:49
 * @LastEditors: zayn 1546492103@qq.com
 * @LastEditTime: 2025-02-25 12:13:36
 * @FilePath: \gopeed-extension-huggingface\README.md
 * @Description:
 *
-->

# Gopeed Extension Huggingface

[簡體中文](readme/README.zh-CN.md) | [繁體中文](readme/README.zh-TW.md) | [English](readme/README.md)

## 功能

- ✅ 支援Huggingface的模型和數據集整個資料夾解析
- ✅ 支援解析huggingface.co || hf-mirror.com || www.modelscope.cn 上同名的模型和數據集, 並自由指定來源站
- ✅ 支援遞歸解析，並自動建立資料夾
- ✅ 支援設定Cookie以便下載Gated Repo
- ...

## 安裝

在插件頁面輸入`https://github.com/DSYZayn/gopeed-extension-huggingface.git`下載即可安裝

## 使用

滿足以下格式的連結即可**解析該資料夾下所有檔案**

`https://<baseUrl>/<user>/<repoType>/<repo>/tree/main/<path>`

- **baseUrl**: huggingface.co || hf-mirror.com || www.modelscope.cn
- **user**: 使用者名稱(組織名稱), 如deepseek-ai
- **repoType**: models || datasets
- **path**: 資料夾路徑， 如果是根目錄則不填, 連同`main/`最後的`/`一起去掉

- 🔴 若要使用modelscope， 則需要該模型或數據集在huggingface中存在，否則無法解析。(modelscope缺少高效簡潔的倉庫元資訊API介面，如確有需要的歡迎PR)
- ❗ 對於倉庫內的單檔案，則直接輸入你手動獲取的連結即可, 本插件對單檔案不做任何解析。
- 🤷‍♂️ 解析時間與目錄深度和檔案數量有關，通常在3秒內可以完成大部分解析。

### Cookie 設定

部分模型需要登入才能下載(Gated Repo)，這種情況下需要設定cookie，否則會出現`401`下載失敗，設定方法如下：

1. 獲取cookie，打開瀏覽器，登入`huggingface.co`，按`F12`打開開發者工具，切換到`Network`選項卡，重新整理頁面，找到`https://huggingface.co`的請求，複製`Cookie`欄位的值
   ![](assets/get-cookie.png)

2. 在擴充功能設定中填入cookie
   ![alt text](assets/set-cookie.png)

### 範例

> 使用hf-mirror或modelscope下載則替換 `huggingface.co` 為 `hf-mirror.com` 或 `www.modelscope.cn`, 參考 `baseUrl`

1. 下載unsloth/DeepSeek-R1-GGUF的根目錄檔案：`https://huggingface.co/models/unsloth/DeepSeek-R1-GGUF/tree/main`
2. 下載unsloth/DeepSeek-R1-GGUF的`Deepseek-R1-BF16`資料夾：`https://huggingface.co/models/unsloth/DeepSeek-R1-GGUF/tree/main/Deepseek-R1-BF16`

小技巧: 以上兩個連結中`models/`可以省略

1. 下載open-thoughts/OpenThoughts-114k的根目錄檔案：`https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k/tree/main`
2. 下載open-thoughts/OpenThoughts-114k的`data`資料夾：`https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k/tree/main/data`

小技巧: 以上兩個連結中`datasets/`絕對不能省略

## 示範

<!-- markdownlint-disable MD033 -->

1.  Input `https://hf-mirror.com/models/unsloth/DeepSeek-R1-GGUF/tree/main`

<img src="https://github.com/DSYZayn/gopeed-extension-huggingface/blob/main/assets/unsloth-DeepSeek-R1-GGUF.png" alt="unsloth-DeepSeek-R1-GGUF" width="800">

2.  Input `https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-BF16`

<img src="https://github.com/DSYZayn/gopeed-extension-huggingface/blob/main/assets/unsloth-DeepSeek-R1-GGUF-BF16.png" alt="unsloth-DeepSeek-R1-GGUF-BF16" width="800">

3.  Input `https://hf-mirror.com/datasets/rubenroy/GammaCorpus-CoT-Math-170k/tree/main`

<img src="https://github.com/DSYZayn/gopeed-extension-huggingface/blob/main/assets/datasets-rubenroy-cot.png" alt="datasets-rubenroy-cot" width="800">

4.  Input `https://hf-mirror.com/datasets/ServiceNow-AI/R1-Distill-SFT/tree/main/v1`

<img src="https://github.com/DSYZayn/gopeed-extension-huggingface/blob/main/assets/datasets-servicenow-r1sft-v1.png" alt="datasets-servicenow-r1sft-v1" width="800">

5.  Input `https://huggingface.co/KwaiVGI/LivePortrait/tree/main`

<img src="https://github.com/DSYZayn/gopeed-extension-huggingface/blob/main/assets/dir-more-than-two-KwaiVGI-LivePortrait.png" alt="KwaiVGI-LivePortrait" width="800">

<!-- markdownlint-disable MD033 -->

## Star 歷史

[![Star 歷史圖表](https://api.star-history.com/svg?repos=DSYZayn/gopeed-extension-huggingface&type=Date)](https://star-history.com/#DSYZayn/gopeed-extension-huggingface&Date)
