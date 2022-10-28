// @flow
import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { Overlay } from 'sulu-admin-bundle/components'
import { action, observable, reaction } from 'mobx';
import SingleItemSelection from 'sulu-admin-bundle/components/SingleItemSelection';
import { translate } from 'sulu-admin-bundle/utils/Translator';
import iconSelectionStyle from './iconSelection.scss';
import classNames from 'classnames';
import { FieldTypeProps } from '../../../types';

@observer
class IconSelection extends React.Component<FieldTypeProps> {
    @observable icons;
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
        const path = this.props.schemaOptions.path !== undefined
            ? this.props.schemaOptions.path.value
            : 'icons';
        const iconsUrl = window.location.origin + '/' + path + '/icons.json';

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
        window.setTimeout(this.scrollToIcon.bind(this), 100);
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
            return <div className={ iconSelectionStyle.iconsErrorMessage }>
                { translate('sulu_admin.icon_selection_no_icons') }
            </div>
        }

        return (
            <Fragment>
                <SingleItemSelection
                    className={ className }
                    disabled={ disabled }
                    emptyText={ translate('sulu_admin.icon_selection_select') }
                    id={ value }
                    leftButton={ {
                        icon: 'su-image',
                        onClick: this.handleOverlayOpen,
                    } }
                    loading={ false }
                    onItemClick={ this.handleOverlayOpen }
                    onRemove={ this.selectedIcon ? this.handleRemove : undefined }
                    valid={ valid }
                    value={ this.selectedIcon }
                >
                    { value &&
                    <div className={ iconSelectionStyle.iconItem }>
                        <div className={ iconSelectionStyle.iconTitle }>{ value }</div>
                    </div>
                    }
                </SingleItemSelection>

                <Overlay
                    confirmText={ translate('sulu_admin.confirm') }
                    onClose={ this.handleOverlayClose }
                    onConfirm={ this.handleOverlayConfirm }
                    open={ this.overlayOpen }
                    title={ translate('sulu_admin.icon_selection_select') }
                >
                    <div className={ iconSelectionStyle.iconsOverlayItems }>
                        { this.icons.map((icon, index) => this.renderIcon(icon, value, index)) }
                    </div>
                </Overlay>
            </Fragment>
        );
    }

    /**
     * Renders a single icon.
     *
     * @param {Object} icon
     * @param {String} value
     * @param {Number} index
     *
     * @returns {JSX.Element|Null}
     */
    renderIcon(icon, value, index) {
        const name = 'icon-' + icon.name;
        const src = '/icons/' + icon.src;

        const classesNames = classNames(
            iconSelectionStyle.iconsOverlayItemContent,
            {
                [iconSelectionStyle.isSelected]: name === this.clickedIcon,
            }
        );

        return <div key={ index } className={ iconSelectionStyle.iconsOverlayItem + ' ' + name }>
            <div className={ classesNames } onClick={ () => {
                this.handleIconClick(name)
            } }>
                <div className={ iconSelectionStyle.iconsOverlayItemTitle }>
                    { name }
                </div>

                <img src={ src } alt={ icon.name }/>

                {/*<svg viewBox="0 0 1000 1000" width="50" height="50">*/}
                {/*    { paths.map((path, index) => this.renderPath(path, index)) }*/}
                {/*</svg>*/}
            </div>
        </div>;
    }

    /**
     * Renders a single SVG path.
     *
     * @param path
     * @param index
     * @returns {JSX.Element|Null}
     */
    renderPath(path, index) {
        return <path d={ path } key={ index } fill="#262626"></path>;
    }
}

export default IconSelection;
