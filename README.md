# Welcome to your CDK JavaScript project

This is a blank project for CDK development with JavaScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

* `npm run test`         perform the jest unit tests
* `cdk deploy -c stage={ENV} -c seq={SEQ} -c instance-id={CONNECT-INSTANCE-ID} -c stream-name={STREAM-NAME}`           deploy this stack to your default AWS account/region
* `cdk diff`             compare deployed stack with current state
* `cdk synth`            emits the synthesized CloudFormation template

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

## Notas

Desplegado en la cuenta de exaprint con los siguienes comandos:

* cdk bootstrap --template bootstrap-template.yaml -c instance-id=356b6522-fee2-4e54-97d1-c84c9c6d2fd9 -c stream-name=callback_connect_dev aws://069688730681/eu-central-1
* cdk deploy -c stage=dev -c instance-id=356b6522-fee2-4e54-97d1-c84c9c6d2fd9 -c stream-name=callback_connect_dev --profile exaprint

