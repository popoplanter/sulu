// @flow
import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { Overlay } from 'sulu-admin-bundle/components'
import { action, observable, reaction, computed } from 'mobx';
import SingleItemSelection from 'sulu-admin-bundle/components/SingleItemSelection';
import { translate } from 'sulu-admin-bundle/utils/Translator';
import iconSelectionStyle from './iconSelection.scss';
import { FieldTypeProps } from '../../../types';
import SingleListOverlay from '../../SingleListOverlay';
import userStore from '../../../stores/userStore';

@observer
class IconSelection extends React.Component<FieldTypeProps> {
    @computed get locale(): IObservableValue<string> {
        const {formInspector} = this.props;

        return formInspector.locale ? formInspector.locale : observable.box(userStore.contentLocale);
    }

    @observable icons;
    @observable iconsPath;
    @observable clickedIcon = null;
    @observable selectedIcon = null;
    @observable overlayOpen: boolean = false;

    static defaultProps = {
        disabled: false,
        valid: true,
        value: null,
    }

    changeDisposer: () => *;

    constructor(props: Props) {
        super(props);

        this.changeDisposer = reaction(
            () => (this.selectedIcon ? this.selectedIcon : undefined),
            (loadedIconName: ?string) => {
                const {onChange, value} = this.props;

                if (value !== loadedIconName) {
                    onChange(this.selectedIcon);
                }
            }
        );
    }

    componentDidMount() {
        this.fetchIcons();
        this.setInitialValue();
    }

    @action fetchIcons() {
        this.iconsPath = this.props.schemaOptions.path !== undefined
            ? this.props.schemaOptions.path.value
            : 'icons';
        const iconsUrl = window.location.origin + '/' + this.iconsPath + '/icons.json';

        fetch(iconsUrl).then(action((response) => response.json()))
                       .then(action((responseJson) => {
                           this.icons = responseJson;
                       })).catch((error) => {
            console.error(error);
        });
    }

    componentWillUnmount() {
        this.changeDisposer();
    }

    @action openOverlay() {
        this.overlayOpen = true;
    }

    @action closeOverlay() {
        this.overlayOpen = false;

        if (this.selectedIcon) {
            this.clickedIcon = this.selectedIcon;
        }
    }

    @action handleRemove = () => {
        this.clickedIcon = null;
        this.selectedIcon = null;
    };

    handleOverlayOpen = () => {
        this.openOverlay();

        if (this.selectedIcon) {
            window.setTimeout(this.scrollToIcon.bind(this), 100);
        }
    };

    handleOverlayClose = () => {
        this.closeOverlay();
    };

    @action handleOverlayConfirm = () => {
        if (this.clickedIcon) {
            this.selectedIcon = this.clickedIcon;
        }

        this.closeOverlay();
    };

    @action handleIconClick = (name: ?string) => {
        this.clickedIcon = name;
    };

    @action setInitialValue = () => {
        this.selectedIcon = this.props.value;
        this.clickedIcon = this.props.value;
    }

    scrollToIcon = () => {
        const container = document.querySelector('.' + iconSelectionStyle.iconsOverlayItems)
        const item = document.querySelector('.' + this.selectedIcon);
        const itemPos = item.offsetTop - item.clientHeight;

        container.parentElement.scrollTo({
            top: itemPos,
            left: 0,
            behavior: 'smooth',
        });
    }

    render() {
        const {className, disabled, valid, value} = this.props;

        if (!this.icons || 0 === this.icons.length) {
            return <div className={iconSelectionStyle.iconsErrorMessage}>
                {translate('sulu_admin.icon_selection_no_icons')}
            </div>
        }

        return (
            <Fragment>
                <SingleItemSelection
                    className={className}
                    disabled={disabled}
                    emptyText={translate('sulu_admin.icon_selection_select')}
                    id={value}
                    leftButton={{
                        icon: 'su-magic',
                        onClick: this.handleOverlayOpen,
                    }}
                    loading={false}
                    onItemClick={this.handleOverlayOpen}
                    onRemove={this.selectedIcon ? this.handleRemove : undefined}
                    valid={valid}
                    value={this.selectedIcon}
                >
                    {value &&
                        <div className={iconSelectionStyle.iconItem}>
                            <div className={iconSelectionStyle.iconTitle}>{value}</div>
                        </div>
                    }
                </SingleItemSelection>

                {/*TODO: Use SingleListOverlay with IconAdapter as adapter*/}

                <SingleListOverlay
                    adapter="icon"
                    disabledIds={[]}
                    itemDisabledCondition={false}
                    listKey="icons"
                    locale={this.locale}
                    onClose={this.handleOverlayClose}
                    onConfirm={this.handleOverlayConfirm}
                    open={this.overlayOpen}
                    options={[]}
                    preSelectedItem={[]}
                    // preSelectedItem={this.selectedIcon}
                    resourceKey="icons"
                    title={translate('sulu_admin.icon_selection_select')}
                />
            </Fragment>
        );
    }
}

export default IconSelection;
