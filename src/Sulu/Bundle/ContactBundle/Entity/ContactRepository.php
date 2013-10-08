<?php
/*
* This file is part of the Sulu CMS.
*
* (c) MASSIVE ART WebServices GmbH
*
* This source file is subject to the MIT license that is bundled
* with this source code in the file LICENSE.
*/

namespace Sulu\Bundle\ContactBundle\Entity;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\QueryBuilder;
use Sulu\Bundle\CoreBundle\Controller\Exception\EntityNotFoundException;

/**
 * Repository for the Codes, implementing some additional functions
 * for querying objects
 */
class ContactRepository extends EntityRepository
{
    public function findById($id)
    {
        // create basic query
        $qb = $this->createQueryBuilder('u')
            ->leftJoin('u.emails', 'emails')
            ->leftJoin('emails.emailType', 'emailType')
            ->leftJoin('u.phones', 'phones')
            ->leftJoin('phones.phoneType', 'phoneType')
            ->leftJoin('u.addresses', 'addresses')
            ->leftJoin('addresses.country', 'country')
            ->leftJoin('addresses.addressType', 'addressType')
            ->leftJoin('u.account', 'account')
            ->leftJoin('u.notes', 'notes')
            ->addSelect('emails')
            ->addSelect('emailType')
            ->addSelect('phones')
            ->addSelect('phoneType')
            ->addSelect('addresses')
            ->addSelect('country')
            ->addSelect('addressType')
            ->addSelect('account')
            ->addSelect('notes')
            ->where('u.id=:id');

        $query = $qb->getQuery();
        $query->setParameter('id', $id);

        try {
            $contact = $query->getSingleResult();

            return $contact;
        } catch (NoResultException $nre) {
            return null;
        }
    }

    /**
     * Searches Entities by where clauses, pagination and sorted
     * @param integer|null $limit Page size for Pagination
     * @param integer|null $offset Offset for Pagination
     * @param array|null $sorting Columns to sort
     * @param array|null $where Where clauses
     * @return array Results
     */
    public function findGetAll($limit = null, $offset = null, $sorting = null, $where = array())
    {
        // create basic query
        $qb = $this->createQueryBuilder('u')
            ->leftJoin('u.emails', 'emails')
            ->leftJoin('u.phones', 'phones')
            ->leftJoin('u.addresses', 'addresses')
            ->leftJoin('u.account', 'account')
            ->addSelect('emails')
            ->addSelect('phones')
            ->addSelect('addresses');

        $qb = $this->addSorting($qb, $sorting, 'u');
        $qb = $this->addPagination($qb, $offset, $limit);

        // if needed add where statements
        if (is_array($where) && sizeof($where) > 0) {
            $qb = $this->addWhere($qb, $where);
        }

        $query = $qb->getQuery();

        return $query->getArrayResult();
    }

    /**
     * Add sorting to querybuilder
     * @param QueryBuilder $qb
     * @param array $sorting
     * @param string $prefix
     * @return QueryBuilder
     */
    private function addSorting($qb, $sorting, $prefix = 'u')
    {
        // add order by
        foreach ($sorting as $k => $d) {
            $qb->addOrderBy($prefix . '.' . $k, $d);
        }

        return $qb;
    }

    /**
     * add pagination to querybuilder
     * @param QueryBuilder $qb
     * @param integer|null $limit Page size for Pagination
     * @param integer|null $offset Offset for Pagination
     * @return QueryBuilder
     */
    private function addPagination($qb, $offset, $limit)
    {
        // add pagination
        $qb->setFirstResult($offset);
        $qb->setMaxResults($limit);

        return $qb;
    }

    /**
     * add where to querybuilder
     * @param QueryBuilder $qb
     * @param array $where
     * @return QueryBuilder
     */
    private function addWhere($qb, $where)
    {
        $and = $qb->expr()->andX();
        foreach ($where as $k => $v) {
            $and->add($qb->expr()->eq($k, $v));
        }
        $qb->where($and);

        return $qb;
    }
}
