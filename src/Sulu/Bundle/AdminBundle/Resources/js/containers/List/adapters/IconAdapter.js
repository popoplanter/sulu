// @flow
import { observer } from 'mobx-react';
import React from 'react';
import FolderList from '../../../components/FolderList';
import Pagination from '../../../components/Pagination';
import { translate } from '../../../utils/Translator';
import FlatStructureStrategy from '../structureStrategies/FlatStructureStrategy';
import DefaultLoadingStrategy from '../loadingStrategies/DefaultLoadingStrategy';
import AbstractAdapter from './AbstractAdapter';
import iconSelectionStyle from '../../Form/fields/iconSelection.scss';

@observer
class IconAdapter extends AbstractAdapter {
    static LoadingStrategy = DefaultLoadingStrategy;

    static StructureStrategy = FlatStructureStrategy;

    static icon = 'su-magic';

    static defaultProps = {
        data: [],
    };

    static getInfoText(item: Object) {
        const label = (item.objectCount === 1)
            ? translate('sulu_admin.object')
            : translate('sulu_admin.objects');

        return `${ item.objectCount } ${ label }`;
    }

    render() {
        const {
            data,
            limit,
            loading,
            onItemClick,
            onLimitChange,
            onPageChange,
            page,
            paginated,
            pageCount,
        } = this.props;

        return (
            <div className={iconSelectionStyle.iconsOverlayItems}>
                {data.map((icon, index) => this.renderIcon(icon, value, index))}
            </div>

            // <FolderList onFolderClick={ onItemClick }>
            //     { data.map((item: Object) => (
            //         // TODO: Don't access properties like "title" directly.
            //         <FolderList.Folder
            //             hasPermissions={ item._hasPermissions }
            //             id={ item.id }
            //             info={ FolderAdapter.getInfoText(item) }
            //             key={ item.id }
            //             title={ item.title }
            //         />
            //     )) }
            // </FolderList>
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
        const src = '/' + this.iconsPath + '/' + icon.src;

        const classesNames = classNames(
            iconSelectionStyle.iconsOverlayItemContent,
            // {
            //     [iconSelectionStyle.isSelected]: name === this.clickedIcon,
            // }
        );

        return <div key={index} className={iconSelectionStyle.iconsOverlayItem + ' ' + name}>
            <div className={classesNames} onClick={() => {
                this.handleIconClick(name)
            }}>
                <div className={iconSelectionStyle.iconsOverlayItemTitle}>
                    {name}
                </div>

                <img src={src} alt={icon.name}/>

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
        return <path d={path} key={index} fill="#262626"></path>;
    }
}

export default IconAdapter;
