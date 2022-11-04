<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\PageBundle\Controller;

use FOS\RestBundle\View\ViewHandlerInterface;
use HandcraftedInTheAlps\RestRoutingBundle\Routing\ClassResourceInterface;
use Sulu\Component\Rest\AbstractRestController;
use Sulu\Component\Rest\ListBuilder\CollectionRepresentation;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class IconController extends AbstractRestController implements ClassResourceInterface
{
    public function __construct(
        ViewHandlerInterface $viewHandler,
    ) {
        parent::__construct($viewHandler);
    }

    /**
     * Returns icons.
     *
     * @return Response
     */
    public function cgetAction(Request $request)
    {
        return $this->handleView(
            $this->view(
                new CollectionRepresentation(
                    ['test'],
                    'icon'
                )
            )
        );
    }
}
