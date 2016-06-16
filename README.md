# Stigmergic-Modeling
Stigmergic-Modeling helps you to create a conceptual model (in the form of class diagram) collaboratively with the help of massive modelers all around the world.
It helps you to learn the attitudes of the modelers toward the construction of the model and helps you to generate a better one.
The entire collaborative mode is web-based. All you need is a web browser to start modeling.

![workspace_page](/readme_pics/workspace_page.png)
![workspace_page_modelview](/readme_pics/workspace_page_modelview.png)

## 所需环境
```
java 1.8.x
maven 3.3.3
neo4j 2.3.3
tomcat 8.0.x
node.js 0.10.x
```

## 配置文件
将 `config_template.xml` 复制两份，分别重命名为 `config.xml` 和 `config_deploy.xml`，并修改其中内容分别用于开发和部署

## 构建前端 javascript 文件
在 `{base}/src/main/javascript/` 目录下，执行
```
npm install （仅第一次时运行）
npm install -g grunt-cli （仅第一次时运行）
./build.sh dev （开发，不做 uglify） 或 ./build.sh dep （部署，做 uglify）
```

## 构建整体项目
在 `{base}/` 目录下执行
```
maven clean （为了安装 extra-lib）
maven install
```

## 部署
在 `{base}/` 目录下执行
```
./deploy.sh
```
