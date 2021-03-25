import React from "react";
import { Typography } from "antd";
import { List, Card } from "antd";
import { Layout } from "antd";
import { Button, Space } from "antd";
import moment from "moment-timezone";

import styles from "./assets/css/Home.module.css";
import logo from "./assets/images/gs-branco.png";

const { Title, Link } = Typography;
const { Content } = Layout;
const data = [
	{
		title: "Status",
		description: "Informa o status das API's.",
	},
	{
		title: "Storage",
		description: "Funções relacionadas a nossa núvem.",
	},
	{
		title: "Translator",
		description: "Traduz textos para a língua desejada.",
	},
	{
		title: "Users",
		description: "Funções relacionadas a usuários.",
	},
];

moment().locale("pt-br");
moment().tz("America/Maceio");

export default function App() {
	return (
		<Layout>
			<Content>
				<div className={styles.home}>
					<img src={logo} alt="Logo" />
					<Title level={2}>
						Todos os serviços feitos pelo Gepetojj, reunídos em um
						só lugar.
					</Title>
					<div className={styles.actions}>
						<Space>
							<Button type="primary">Users</Button>
							<Button>Storage</Button>
						</Space>
					</div>
				</div>
				<div className={styles.menu}>
					<Title level={2}>Lista de API's disponíveis:</Title>
					<List
						grid={{
							gutter: 16,
							xxl: 2,
						}}
						dataSource={data}
						renderItem={(item) => (
							<List.Item>
								<Card title={item.title}>
									{item.description}
								</Card>
							</List.Item>
						)}
					/>
					<Title level={2}>
						Veja mais detalhes na{" "}
						<Link href="/api/docs" target="_blank">
							documentação.
						</Link>
					</Title>
				</div>
			</Content>
		</Layout>
	);
}
