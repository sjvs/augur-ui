import React, { Component } from 'react';
import { render } from 'react-dom';
import classnames from 'classnames';

import Router from 'base/router';

import SiteHeader from 'modules/site/components/site-header';
import SiteFooter from 'modules/site/components/site-footer';
import SideBar from 'modules/site/components/side-bar';
import CoreStats from 'modules/common/components/core-stats';

import shouldComponentUpdatePure from 'utils/should-component-update-pure';

export default function (appElement, selectors) {
	render(<AppComponent {...selectors} />, appElement);
}

class AppComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSideBarAllowed: false,
			isSideBarCollapsed: false,
			doScrollTop: false
		};

		this.shouldComponentUpdate = shouldComponentUpdatePure;

		this.handleScrollTop = this.handleScrollTop.bind(this);
		this.shouldDisplaySideBar = this.shouldDisplaySideBar.bind(this);
	}

	componentDidMount() {
		this.shouldDisplaySideBar();
	}

	componentDidUpdate() {
		this.shouldDisplaySideBar();
		this.handleScrollTop();
	}

	handleScrollTop() {
		const p = this.props;

		if (p.url !== window.location.pathname + window.location.search) {
			window.history.pushState(null, null, p.url);
			this.setState({ doScrollTop: true });
		}

		if (this.state.doScrollTop) {
			window.document.getElementById('view_container').scrollTop = 0;
			this.setState({ doScrollTop: false });
		}
	}

	shouldDisplaySideBar() {
		const currentRoute = Router(this.props);

		if (currentRoute.props.sideBarAllowed) {
			this.setState({ isSideBarAllowed: true });
		} else {
			this.setState({ isSideBarAllowed: false });
		}
	}

	toggleSideBar() {
		this.setState({ isSideBarCollapsed: !this.state.isSideBarCollapsed });
	}

	render() {
		const p = this.props;
		const s = this.state;
		const siteHeaderProps = {
			isSideBarAllowed: s.isSideBarAllowed,
			isSideBarCollapsed: s.isSideBarCollapsed,
			toggleSideBar: () => { this.toggleSideBar(); },
			activeView: p.activeView,
			loginAccount: p.loginAccount,
			positionsSummary: p.positionsSummary,
			transactionsTotals: p.transactionsTotals,
			isTransactionsWorking: p.isTransactionsWorking,
			marketsInfo: p.marketsHeader,
			marketsLink: (p.links && p.links.marketsLink) || undefined,
			favoritesLink: (p.links && p.links.favoritesLink) || undefined,
			pendingReportsLink: (p.links && p.links.pendingReportsLink) || undefined,
			transactionsLink: (p.links && p.links.transactionsLink) || undefined,
			authLink: (p.links && p.links.authLink) || undefined,
			accountLink: (p.links && p.links.accountLink) || undefined,
			accountLinkText: (p.loginAccount && p.loginAccount.linkText) || undefined,
			myPositionsLink: (p.links && p.links.myPositionsLink) || undefined,
			portfolioTotals: (p.portfolio && p.portfolio.totals) || undefined
		};
		const sideBarProps = {
			tags: p.tags,
			loginAccount: p.loginAccount
		};

		return (
			<main>
				{!!p &&
					<div id="app_container" >
						<div id="app_header">
							<SiteHeader {...siteHeaderProps} />
							<div className={classnames('sub-header', (!p.loginAccount || !p.loginAccount.address) && 'logged-out')} >
								{p.loginAccount && p.loginAccount.id &&
									<CoreStats coreStats={p.coreStats} />
								}
							</div>
						</div>
						<div id="app_view_container" >
							{s.isSideBarAllowed &&
								<div id="side_bar" >
									<SideBar {...sideBarProps} />
								</div>
							}
							<div id="app_view">
								<Router {...p} />
							</div>
						</div>
						<SiteFooter />
					</div>
				}
			</main>
		);
	}
}
