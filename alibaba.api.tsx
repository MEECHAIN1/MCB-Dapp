'use strict';
// This file is auto-generated, don't edit it
// Dependent modules can be viewed by downloading the module dependency file in the project or obtaining SDK dependency information in the upper right corner
const ecs_workbench20220220 = require('@alicloud/ecs-workbench20220220');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const Credential = require('@alicloud/credentials');
const Tea = require('@alicloud/tea-typescript');

class Client {

  /**
   * Initialize the Client with the credentials
   * @return Client
   * @throws Exception
   */
  static createClient() {
    // It is recommended to use the default credential. For more credentials, please refer to: https://www.alibabacloud.com/help/en/alibaba-cloud-sdk-262060/latest/credentials-settings-5.
    let credential = new Credential.default();
    let config = new OpenApi.Config({
      credential: credential,
    });
    // See https://api.alibabacloud.com/product/ecs-workbench.
    config.endpoint = `ecs-workbench.cn-hangzhou.aliyuncs.com`;
    return new ecs_workbench20220220.default(config);
  }

  static async main(args) {
    let client = Client.createClient();
    let loginInstanceRequest = new ecs_workbench20220220.LoginInstanceRequest({ });
    try {
      let resp = await client.loginInstanceWithOptions(loginInstanceRequest, new Util.RuntimeOptions({ }));
      console.log(JSON.stringify(resp, null, 2));
    } catch (error) {
      // Only a printing example. Please be careful about exception handling and do not ignore exceptions directly in engineering projects.
      // print error message
      console.log(error.message);
      // Please click on the link below for diagnosis.
      console.log(error.data["Recommend"]);
    }    
  }

}

exports.Client = Client;
Client.main(process.argv.slice(2));
